import { supabase } from "./supabase.js";

const container = document.getElementById("lessons-container");

// Step 1: Confirm script file is executing
container.innerHTML = "<p>Connecting to database...</p>";

async function loadLessons() {
    try {
        const { data, error } = await supabase
            .from("lessons")
            .select("id, title, description, level, thumbnail, order_no")
            .eq("published", true)
            .order("order_no", { ascending: true });

        // Step 2: Handle database response
        if (error) {
            container.innerHTML = `<p style="color: red;">Database Error: ${error.message}</p>`;
            return;
        }

        if (!data || data.length === 0) {
            container.innerHTML = "<p>Connected! But no published lessons were found in the database.</p>";
            return;
        }

        // Step 3: Render results
        container.innerHTML = data.map(lesson => `
            <article class="lesson-card">
                <h3>${lesson.title}</h3>
                ${lesson.description ? `<p>${lesson.description}</p>` : ""}
                ${lesson.level ? `<small>Level: ${lesson.level}</small>` : ""}
                <br><br>
                <a href="lesson.html?id=${lesson.id}">Open Lesson</a>
            </article>
        `).join("");

    } catch (err) {
        container.innerHTML = `<p style="color: red;">Network / Script Failure: ${err.message}</p>`;
    }
}

loadLessons();