/**
 * Nuer Number Converter Logic
 * Implements recursive translation rules for Nuer numbers.
 */

const digits = [
    "baŋ", "kɛl", "rɛw", "diɔ̱k", "ŋuaan",
    "dhieec", "bäkɛl", "bärɔw", "bädäk", "bäŋuan"
];

export function getNuerNumber(num) {
    let n;
    try {
        n = typeof num === "bigint" ? num : BigInt(num);
    } catch (e) {
        return null;
    }

    const maxLimit = 999999999999999999n;
    if (n < -maxLimit || n > maxLimit) {
        return null;
    }

    // Negative number handling
    if (n < 0n) {
        const posVal = -n;
        let prefix = "";
        if (n === -1n) {
            prefix = "ŋuɔk ";
        } else if (n >= -19n) {
            prefix = "ŋuɔɔk da̱ŋ ";
        } else {
            prefix = "ŋuɔɔk ti̱ ";
        }
        return prefix + getNuerNumber(posVal);
    }

    // Single Digits (0 - 9)
    if (n <= 9n) {
        return digits[Number(n)];
    }

    // Tens (10 - 99)
    if (n <= 99n) {
        if (n === 10n) return "wäl";
        if (n < 20n) return `wäl ${digits[Number(n % 10n)]}`;
        
        const first = Number(n / 10n);
        const last = Number(n % 10n);
        const base = `jiɛn da̱ŋ ${digits[first]}`;
        return last === 0 ? base : `${base} wi̱dɛ ${digits[last]}`;
    }

    // Hundreds (100 - 199)
    if (n <= 199n) {
        const r = n % 100n;
        return r === 0n ? "kuɔ̱r kɛl" : `kuɔ̱r kɛl wi̱dɛ ${getNuerNumber(r)}`;
    }

    // Hundreds (200 - 999)
    if (n <= 999n) {
        const h = Number(n / 100n);
        const r = n % 100n;
        const base = `kur ${digits[h]}`;
        return r === 0n ? base : `${base} wi̱dɛ ${getNuerNumber(r)}`;
    }

    // Large Scales (Powers of 10)
    const scales = [
        { limit: 1000000000000000n, sing: "kua-di̱li̱öön", small: "kua-di̱li̱ööni̱", large: "kua-di̱li̱ööni̱ ti̱" },
        { limit: 1000000000000n,    sing: "taanydɔr",     small: "taanydɔri̱",     large: "taanydɔri̱ ti̱" },
        { limit: 1000000000n,       sing: "bi̱li̱öön",      small: "bi̱li̱ööni̱",      large: "bi̱li̱ööni̱ ti̱" },
        { limit: 1000000n,          sing: "mi̱li̱öön",       small: "mi̱li̱ööni̱",       large: "mi̱li̱ööni̱ ti̱" },
        { limit: 1000n,             sing: "ki̱th",          small: "ki̱thni̱",          large: "ki̱thni̱ ti̱" }
    ];

    for (const scale of scales) {
        if (n >= scale.limit) {
            const q = n / scale.limit;
            const r = n % scale.limit;
            
            let prefix = "";
            if (q === 1n) {
                prefix = `${scale.sing} `;
            } else if (q < 20n) {
                prefix = `${scale.small} `;
            } else {
                prefix = `${scale.large} `;
            }

            const base = prefix + getNuerNumber(q);
            return r === 0n ? base : `${base} wi̱dɛ ${getNuerNumber(r)}`;
        }
    }

    return null;
}

// Bind live DOM event listener
document.addEventListener("DOMContentLoaded", () => {
    const inputEl = document.getElementById("number-input");
    const outputEl = document.getElementById("number-output");

    if (!inputEl || !outputEl) return;

    inputEl.addEventListener("input", (e) => {
        const value = e.target.value.trim();
        if (value === "") {
            outputEl.innerText = "Enter a number above to generate Nuer translation...";
            return;
        }

        const nuerTranslation = getNuerNumber(value);
        if (nuerTranslation === null) {
            outputEl.innerText = "Number out of range or invalid input.";
        } else {
            outputEl.innerText = nuerTranslation;
        }
    });
});