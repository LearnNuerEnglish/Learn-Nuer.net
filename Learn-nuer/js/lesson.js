import { supabase } from "./supabase.js";

const container = document.getElementById("lesson-detail");

// Read ?id= from URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get("id");

async function loadLessonDetail() {
    if (!lessonId) {
        container.innerHTML = `<p style="color: red;">No lesson ID specified in URL.</p>`;
        return;
    }

    // Query single record by primary key
    const { data: lesson, error } = await supabase
        .from("lessons")
        .select("id, title, description, level, thumbnail")
        .eq("id", lessonId)
        .single();

    if (error) {
        console.error("Error fetching lesson:", error);
        container.innerHTML = `<p style="color: red;">Failed to load lesson: ${error.message}</p>`;
        return;
    }

    if (!lesson) {
        container.innerHTML = `<p>Lesson not found.</p>`;
        return;
    }

    // Set page tab title
    document.title = `${lesson.title} — Learn Nuer`;

    // Render detailed lesson view
    container.innerHTML = `
        ${lesson.thumbnail 
            ? `<img src="${lesson.thumbnail}" alt="${lesson.title}" class="lesson-header-img">` 
            : ""
        }
        <h2>${lesson.title}</h2>
        ${lesson.level ? `<p><strong>Level:</strong> ${lesson.level}</p>` : ""}
        ${lesson.description ? `<p class="description">${lesson.description}</p>` : ""}
        
        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
        
        <div id="lesson-items">
            <p>Welcome to <strong>${lesson.title}</strong>!</p>
        </div>
    `;
}

loadLessonDetail();