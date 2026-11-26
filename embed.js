(() => {
    const script = document.currentScript;
    const quizUrl = new URL("./index.html", script.src);
    const frame = document.createElement("iframe");

    frame.src = quizUrl.href;
    frame.title = "Naturen jobber – quiz";
    frame.style.display = "block";
    frame.style.width = "100%";
    frame.style.height = "740px";
    frame.style.border = "0";

    // Vertssiden lytter bare til høyder fra denne iframen.
    window.addEventListener("message", (event) => {
        if (event.source !== frame.contentWindow || event.origin !== quizUrl.origin) return;

        const { type, height } = event.data ?? {};
        if (type === "naturen-jobber:height" && Number.isSafeInteger(height) && height > 0) {
            frame.style.height = `${height}px`;
        }
    });

    frame.addEventListener("load", () => {
        frame.contentWindow.postMessage({ type: "naturen-jobber:ready" }, quizUrl.origin);
    });

    script.after(frame);
})();
