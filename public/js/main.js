document.addEventListener("DOMContentLoaded", () => {
  // Add copy functionality to code blocks
  document.querySelectorAll("pre code").forEach((block) => {
    block.addEventListener("click", () => {
      const text = block.textContent;
      navigator.clipboard.writeText(text).then(() => {
        // Show a brief "Copied!" message
        const message = document.createElement("div");
        message.textContent = "Copied!";
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            transition: opacity 0.3s;
          `;
        document.body.appendChild(message);
        setTimeout(() => {
          message.style.opacity = "0";
          setTimeout(() => message.remove(), 300);
        }, 2000);
      });
    });
  });
});