import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://xgqmiervjiilufszooom.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_aP0rSAB9NNOMjZHGLt-ixg_dbo5LqIM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

let dictionaryData = [];

/**
 * Phonetic Transformation Engine
 * Adjusts orthography to ensure natural TTS pronunciation and visual hints
 */
function getPhoneticRepresentation(text) {
    if (!text) return "";
    return text
        .replace(/DH/g, "Th")
        .replace(/dh/g, "th")
        .replace(/NY/g, "Ñ")
        .replace(/Ny/g, "Ñ")
        .replace(/ny/g, "ñ")
        .replace(/Ɣ/g, "H")
        .replace(/ɣ/g, "h")
        .replace(/NH/g, "N")
        .replace(/nh/g, "n")
        .replace(/Nh/g, "N")
        .replace(/UA/g, "Wa")
        .replace(/ua/g, "wa")
        .replace(/ua/g, "wa")
        .replace(/ec/g, "etch")
        // Soft C rule: Prevents browser engines from pronouncing 'c' as 'k'
        .replace(/C/g, "Ch")
        .replace(/c/g, "ch");
}

async function loadGatDictionary() {
    const container = document.getElementById("dictionary-container");

    try {
        const { data, error } = await supabase
            .from("gat")
            .select("id, nuer, eng, speech_id, def_id")
            .order("nuer", { ascending: true });

        if (error) throw error;

        dictionaryData = data || [];
        populateSpeechFilter(dictionaryData);
        renderDictionary(dictionaryData);
    } catch (err) {
        console.error("Error loading 'gat' table:", err);
        container.innerHTML = `
            <div class="loading-text" style="color: #c53030;">
                <strong>Database Error:</strong> ${escapeHtml(err.message)}
            </div>`;
    }
}

function renderDictionary(records) {
    const container = document.getElementById("dictionary-container");

    if (records.length === 0) {
        container.innerHTML = `<div class="loading-text">No matching dictionary terms found.</div>`;
        return;
    }

    container.innerHTML = records.map(entry => {
        const nuerWord = entry.nuer || "—";
        const englishTrans = entry.eng || "—";
        const speechTag = entry.speech_id ?? "Noun";
        const definition = entry.def_id ?? "No definition available.";
        
        const phoneticSpelling = getPhoneticRepresentation(nuerWord);

        return `
            <div class="dict-card">
                <div>
                    <div class="dict-header">
                        <div>
                            <h3 class="nuer-word">${escapeHtml(nuerWord)}</h3>
                            <div class="phonetic-hint">[ ${escapeHtml(phoneticSpelling)} ]</div>
                        </div>
                        <span class="badge-speech">${escapeHtml(String(speechTag))}</span>
                    </div>
                    
                    <div class="english-translation">${escapeHtml(englishTrans)}</div>
                    <div class="definition-text">${escapeHtml(String(definition))}</div>
                </div>

                <button class="audio-btn" data-word="${escapeHtml(nuerWord)}">
                    🔊 Pronounce
                </button>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.audio-btn').forEach(button => {
        button.addEventListener('click', () => {
            const rawWord = button.getAttribute('data-word');
            speakWord(rawWord);
        });
    });
}

function speakWord(originalText) {
    if (!('speechSynthesis' in window)) {
        alert("Text-to-speech is not supported in this browser.");
        return;
    }
    
    const phoneticText = getPhoneticRepresentation(originalText);

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phoneticText);
    utterance.rate = 0.85;

    window.speechSynthesis.speak(utterance);
}

function populateSpeechFilter(records) {
    const speechSelect = document.getElementById("speech-filter");
    if (!speechSelect) return;

    const speechTypes = [...new Set(records.map(r => r.speech_id).filter(Boolean))];
    
    speechTypes.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        speechSelect.appendChild(option);
    });
}

function filterDictionary() {
    const searchTerm = document.getElementById("search-input").value.toLowerCase().trim();
    const selectedSpeech = document.getElementById("speech-filter").value;

    const filtered = dictionaryData.filter(item => {
        const matchesSearch = 
            (item.nuer && item.nuer.toLowerCase().includes(searchTerm)) ||
            (item.eng && item.eng.toLowerCase().includes(searchTerm)) ||
            (item.def_id && String(item.def_id).toLowerCase().includes(searchTerm));

        const matchesSpeech = selectedSpeech === "" || String(item.speech_id) === selectedSpeech;

        return matchesSearch && matchesSpeech;
    });

    renderDictionary(filtered);
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[m]);
}

document.addEventListener("DOMContentLoaded", () => {
    loadGatDictionary();

    document.getElementById("search-input")?.addEventListener("input", filterDictionary);
    document.getElementById("speech-filter")?.addEventListener("change", filterDictionary);
});