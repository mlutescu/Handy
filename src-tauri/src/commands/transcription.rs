use crate::managers::history::HistoryManager;
use crate::managers::transcription::TranscriptionManager;
use crate::settings::{get_settings, write_settings, ModelUnloadTimeout};
use serde::Serialize;
use specta::Type;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, State};

#[derive(Serialize, Type)]
pub struct ModelLoadStatus {
    is_loaded: bool,
    current_model: Option<String>,
}

#[tauri::command]
#[specta::specta]
pub fn set_model_unload_timeout(app: AppHandle, timeout: ModelUnloadTimeout) {
    let mut settings = get_settings(&app);
    settings.model_unload_timeout = timeout;
    write_settings(&app, settings);
}

#[tauri::command]
#[specta::specta]
pub fn get_model_load_status(
    transcription_manager: State<TranscriptionManager>,
) -> Result<ModelLoadStatus, String> {
    Ok(ModelLoadStatus {
        is_loaded: transcription_manager.is_model_loaded(),
        current_model: transcription_manager.get_current_model(),
    })
}

#[tauri::command]
#[specta::specta]
pub fn unload_model_manually(
    transcription_manager: State<TranscriptionManager>,
) -> Result<(), String> {
    transcription_manager
        .unload_model()
        .map_err(|e| format!("Failed to unload model: {}", e))
}

/// Called from the review dialog when the user confirms (inserts) the text.
/// Pastes `edited_text` into the previously-focused application and, when the
/// text differs from `original_text`, persists a correction pair in the
/// history database for future Whisper fine-tuning.
#[tauri::command]
#[specta::specta]
pub fn confirm_transcription(
    app: AppHandle,
    history_manager: State<'_, Arc<HistoryManager>>,
    original_text: String,
    edited_text: String,
) -> Result<(), String> {
    if original_text != edited_text && !original_text.is_empty() && !edited_text.is_empty() {
        if let Err(e) = history_manager.save_correction(original_text, edited_text.clone()) {
            log::error!("Failed to save correction: {}", e);
        }
    }

    crate::overlay::hide_review_overlay(&app);

    let app_clone = app.clone();
    let text = edited_text;
    app.run_on_main_thread(move || {
        match crate::clipboard::paste(text, app_clone.clone()) {
            Ok(()) => log::debug!("Review-confirmed text pasted successfully"),
            Err(e) => {
                log::error!("Failed to paste confirmed transcription: {}", e);
                let _ = app_clone.emit("paste-error", ());
            }
        }
    })
    .map_err(|e| format!("Failed to dispatch paste to main thread: {:?}", e))
}

/// Called from the review dialog when the user cancels (Escape). Discards
/// the transcribed text without inserting anything.
#[tauri::command]
#[specta::specta]
pub fn cancel_transcription(app: AppHandle) -> Result<(), String> {
    crate::overlay::hide_review_overlay(&app);
    Ok(())
}
