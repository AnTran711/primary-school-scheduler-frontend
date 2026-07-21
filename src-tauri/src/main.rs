// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::collections::HashMap;
use std::fs;
use std::io::BufRead;
use std::path::PathBuf;
use std::process::{Command, Child};
use std::sync::Mutex;
use tauri::Manager;

/// Lưu trữ tiến trình backend để có thể tắt khi app đóng
struct BackendProcess(Mutex<Option<Child>>);

/// Loại bỏ prefix \\?\ khỏi đường dẫn Windows
/// (Java không hiểu dạng extended-length path này)
fn clean_path(path: PathBuf) -> PathBuf {
    let path_str = path.to_string_lossy().to_string();
    if path_str.starts_with("\\\\?\\") {
        PathBuf::from(&path_str[4..])
    } else {
        path
    }
}

/// Tìm đường dẫn tới thư mục binaries (hỗ trợ cả dev mode và production)
fn find_binaries_dir(app: &tauri::App) -> PathBuf {
    // 1. Thử resource_dir (production)
    if let Ok(resource_path) = app.path().resource_dir() {
        let binaries_dir = resource_path.join("binaries");
        if binaries_dir.exists() {
            let clean = clean_path(binaries_dir);
            eprintln!("[Tauri] Tìm thấy binaries tại resource_dir: {:?}", clean);
            return clean;
        }
    }

    // 2. Thử đường dẫn tương đối (dev mode)
    let dev_paths = [
        PathBuf::from("binaries"),
        PathBuf::from("src-tauri").join("binaries"),
    ];
    for path in &dev_paths {
        if path.exists() {
            let canonical = fs::canonicalize(path).unwrap_or_else(|_| path.clone());
            eprintln!("[Tauri] Tìm thấy binaries (dev mode) tại: {:?}", canonical);
            return canonical;
        }
    }

    // 3. Thử CARGO_MANIFEST_DIR (dev mode)
    if let Ok(manifest_dir) = std::env::var("CARGO_MANIFEST_DIR") {
        let binaries_dir = PathBuf::from(&manifest_dir).join("binaries");
        if binaries_dir.exists() {
            eprintln!("[Tauri] Tìm thấy binaries qua CARGO_MANIFEST_DIR: {:?}", binaries_dir);
            return binaries_dir;
        }
    }

    panic!("Không tìm thấy thư mục binaries!");
}

/// Đọc file .env và trả về HashMap các biến môi trường
fn load_env_file(path: &std::path::Path) -> HashMap<String, String> {
    let mut env_vars = HashMap::new();
    if let Ok(file) = fs::File::open(path) {
        let reader = std::io::BufReader::new(file);
        for line in reader.lines().map_while(Result::ok) {
            let line = line.trim().to_string();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            if let Some((key, value)) = line.split_once('=') {
                env_vars.insert(
                    key.trim().to_string(),
                    value.trim().trim_matches('"').trim_matches('\'').to_string(),
                );
            }
        }
    }
    env_vars
}

/// Tắt tiến trình Spring Boot
fn kill_backend(process: &mut Child) {
    eprintln!("[Tauri] Đang tắt Spring Boot (PID: {})...", process.id());

    #[cfg(target_os = "windows")]
    {
        let pid = process.id().to_string();
        let _ = Command::new("taskkill")
            .args(["/PID", &pid, "/T", "/F"])
            .output();
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = process.kill();
    }

    let _ = process.wait();
    eprintln!("[Tauri] Spring Boot đã tắt.");
}

fn main() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(BackendProcess(Mutex::new(None)))
        .setup(|app| {
            let binaries_dir = find_binaries_dir(app);

            // Đường dẫn tới Java
            #[cfg(target_os = "windows")]
            let java_exe = binaries_dir.join("jre").join("bin").join("java.exe");
            #[cfg(not(target_os = "windows"))]
            let java_exe = binaries_dir.join("jre").join("bin").join("java");

            // Đường dẫn tới backend.jar
            let jar_path = binaries_dir.join("backend.jar");

            // Kiểm tra file tồn tại
            if !java_exe.exists() {
                eprintln!("[Tauri] LỖI: Không tìm thấy java tại: {:?}", java_exe);
                return Err(format!("Không tìm thấy Java tại: {:?}", java_exe).into());
            }
            if !jar_path.exists() {
                eprintln!("[Tauri] LỖI: Không tìm thấy backend.jar tại: {:?}", jar_path);
                return Err(format!("Không tìm thấy backend.jar tại: {:?}", jar_path).into());
            }

            eprintln!("[Tauri] Khởi động Spring Boot...");
            eprintln!("[Tauri]   Java: {:?}", java_exe);
            eprintln!("[Tauri]   JAR:  {:?}", jar_path);

            // Tạo log files cho Spring Boot output
            let log_dir = binaries_dir.parent().unwrap_or(&binaries_dir).to_path_buf();
            let stdout_log = fs::File::create(log_dir.join("spring-boot-stdout.log"))
                .unwrap_or_else(|_| {
                    fs::File::create(std::env::temp_dir().join("spring-boot-stdout.log"))
                        .expect("Không thể tạo file log")
                });
            let stderr_log = fs::File::create(log_dir.join("spring-boot-stderr.log"))
                .unwrap_or_else(|_| {
                    fs::File::create(std::env::temp_dir().join("spring-boot-stderr.log"))
                        .expect("Không thể tạo file log")
                });
            eprintln!("[Tauri] Log files tại: {:?}", log_dir);

            // Load biến môi trường từ binaries/.env
            let env_file = binaries_dir.join(".env");
            let env_vars = if env_file.exists() {
                let vars = load_env_file(&env_file);
                eprintln!("[Tauri] Đã load {} biến môi trường từ {:?}", vars.len(), env_file);
                for key in vars.keys() {
                    eprintln!("[Tauri]   ENV: {}", key);
                }
                vars
            } else {
                eprintln!("[Tauri] CẢNH BÁO: Không tìm thấy {:?}", env_file);
                HashMap::new()
            };

            // Cấu hình command chạy Spring Boot
            let mut cmd = Command::new(&java_exe);
            cmd.arg("-jar")
               .arg(&jar_path)
               .stdout(stdout_log)
               .stderr(stderr_log)
               .envs(&env_vars);

            #[cfg(target_os = "windows")]
            {
                use std::os::windows::process::CommandExt;
                cmd.creation_flags(0x08000200); // CREATE_NEW_PROCESS_GROUP + CREATE_NO_WINDOW
            }

            let child = cmd.spawn().map_err(|e| {
                eprintln!("[Tauri] Lỗi spawn Spring Boot: {}", e);
                format!("Không thể khởi động Spring Boot: {}", e)
            })?;

            eprintln!("[Tauri] Spring Boot đã khởi động với PID: {}", child.id());

            let state = app.state::<BackendProcess>();
            *state.0.lock().unwrap() = Some(child);

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("Lỗi khi build tauri app");

    // Xử lý tắt Spring Boot khi app thoát (dùng RunEvent::Exit thay vì WindowEvent::Destroyed)
    app.run(|app_handle, event| {
        if let tauri::RunEvent::Exit = event {
            let state = app_handle.state::<BackendProcess>();
            if let Ok(mut process_lock) = state.0.lock() {
                if let Some(mut process) = process_lock.take() {
                    kill_backend(&mut process);
                }
            };
        }
    });
}
