(() => {
    const quiz = document.querySelector(".quiz");
    const isStandalone = window.parent === window;
    const isOverlay = new URLSearchParams(window.location.search).get("view") === "overlay";
    quiz.classList.toggle("quiz--viewport", isStandalone || isOverlay);
    quiz.classList.toggle("quiz--overlay", isOverlay);
    if (isStandalone) return;

    window.addEventListener("message", function startResizing(event) {
        if (event.source !== window.parent || event.origin === "null") return;
        if (event.data?.type === "naturen-jobber:overlay") {
            window.addEventListener("keydown", (keyEvent) => {
                if (keyEvent.key !== "Escape" || keyEvent.defaultPrevented) return;
                keyEvent.preventDefault();
                window.parent.postMessage({ type: "naturen-jobber:close" }, event.origin);
            });
            window.removeEventListener("message", startResizing);
            return;
        }
        if (event.data?.type !== "naturen-jobber:ready") return;
        quiz.classList.remove("quiz--viewport", "quiz--overlay");

        // Mål selve quizen. Høyden på dokumentet kan følge høyden iframen allerede har.
        function reportHeight() {
            const height = Math.ceil(quiz.getBoundingClientRect().height);
            window.parent.postMessage({ type: "naturen-jobber:height", height }, event.origin);
        }

        const observer = new ResizeObserver(reportHeight);
        observer.observe(quiz, { box: "border-box" });
        reportHeight();
        window.removeEventListener("message", startResizing);
    });
})();
