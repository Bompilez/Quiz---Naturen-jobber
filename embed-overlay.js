(() => {
    const script = document.currentScript;
    const quizUrl = new URL("./index.html?view=overlay", script.src);
    const launcher = document.createElement("button");
    launcher.type = "button";
    launcher.textContent = "Start quiz";
    launcher.setAttribute("aria-haspopup", "dialog");
    Object.assign(launcher.style, {
        padding: "0.75rem 1.25rem",
        border: "0",
        borderRadius: "0.375rem",
        background: "#262a35",
        color: "white",
        font: "inherit",
        fontWeight: "700",
        cursor: "pointer",
    });

    const dialog = document.createElement("dialog");
    dialog.setAttribute("aria-label", "Naturen jobber – quiz");
    Object.assign(dialog.style, {
        position: "fixed",
        inset: "0",
        width: "100%",
        height: "100vh",
        maxWidth: "none",
        maxHeight: "none",
        margin: "0",
        padding: "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)",
        border: "0",
        background: "white",
        color: "#151e29",
        boxSizing: "border-box",
        overflow: "hidden",
    });
    dialog.style.height = "100dvh";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "Tilbake";
    closeButton.setAttribute("aria-label", "Tilbake til siden");
    closeButton.autofocus = true;
    Object.assign(closeButton.style, {
        position: "absolute",
        top: "calc(env(safe-area-inset-top) + clamp(1rem, 6.7vw, 1.75rem))",
        left: "calc(env(safe-area-inset-left) + clamp(1rem, 6.7vw, 1.75rem) + 0.75rem)",
        zIndex: "1",
        minWidth: "2.75rem",
        height: "2.75rem",
        padding: "0",
        border: "0",
        borderRadius: "0.375rem",
        background: "white",
        color: "#151e29",
        font: "600 0.75rem/1 Arial, Helvetica, sans-serif",
        cursor: "pointer",
    });

    const frame = document.createElement("iframe");
    frame.title = "Naturen jobber – quiz";
    Object.assign(frame.style, {
        display: "block",
        width: "100%",
        height: "100%",
        minHeight: "0",
        border: "0",
    });

    dialog.append(closeButton);
    document.body.append(dialog);
    script.after(launcher);

    const page = document.documentElement;
    let previousOverflow;

    launcher.addEventListener("click", () => {
        if (!frame.isConnected) {
            frame.src = quizUrl.href;
            dialog.append(frame);
        }

        previousOverflow = page.style.overflow;
        dialog.showModal();
        page.style.overflow = "hidden";
    });

    closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
        page.style.overflow = previousOverflow;
        launcher.focus({ preventScroll: true });
    });

    frame.addEventListener("load", () => {
        frame.contentWindow.postMessage({ type: "naturen-jobber:overlay" }, quizUrl.origin);
    });

    window.addEventListener("message", (event) => {
        if (!dialog.open || event.source !== frame.contentWindow || event.origin !== quizUrl.origin) return;
        if (event.data?.type === "naturen-jobber:close") dialog.close();
    });
})();
