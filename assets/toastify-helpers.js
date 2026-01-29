/**
 * Toast Helpers - Estilo React Hot Toast (sin librerías externas)
 *
 * - Réplica visual y animaciones cercanas a react-hot-toast.
 * - API compatible con el helper previo (success, error, warning, info, show).
 * - Requiere toastify-helpers.css para los estilos.
 *
 * Instalación:
 *   <link rel="stylesheet" href="toastify-helpers.css">
 *   <script src="toastify-helpers.js"></script>
 *
 * Uso:
 *   ToastifyUtils.success("Éxito", "Se guardó correctamente");
 *   ToastifyUtils.error("Error", "No se pudo guardar");
 *   ToastifyUtils.show({ variant: "info", title: "Hola", message: "..." });
 *
 * Opciones soportadas (backward compatible con `toastify`):
 *   - toastify.duration: duración en ms (por defecto 4000). Con 0 no se cierra.
 *   - toastify.onClick: callback al hacer click en el toast.
 *   - toastify.style: estilos inline extra para el contenedor del toast.
 */

const ToastifyUtils = (() => {
  let defaults = {
    duration: 4000,
    style: {},
  };

  const ICONS = {
    success: `
      <div class="hot-toast-icon hot-toast-icon-success">
        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    `,
    error: `
      <div class="hot-toast-icon hot-toast-icon-error">
        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    `,
    warning: `
      <div class="hot-toast-icon hot-toast-icon-warning">
        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 7v6" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 17h.01" />
        </svg>
      </div>
    `,
    info: `
      <div class="hot-toast-icon hot-toast-icon-info">
        <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 16V12" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8h.01" />
        </svg>
      </div>
    `,
    loading: `
      <div class="hot-toast-icon hot-toast-icon-loading"></div>
    `,
  };

  const getContainer = () => {
    let container = document.querySelector(".hot-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "hot-toast-container";
      document.body.appendChild(container);
    }
    return container;
  };

  const normalizeVariant = (variant) => {
    const v = String(variant || "info").toLowerCase();
    return ["success", "error", "warning", "info", "loading"].includes(v)
      ? v
      : "info";
  };

  const buildHtml = ({ variant, title, message, withIcon, html }) => {
    if (typeof html === "string") return html;

    const v = normalizeVariant(variant);
    const safeTitle =
      title !== undefined && title !== null && String(title).trim() !== ""
        ? String(title)
        : v.charAt(0).toUpperCase() + v.slice(1);
    const safeMessage =
      message !== undefined && message !== null ? String(message) : "";

    const icon = withIcon ? ICONS[v] || "" : "";
    const msgHtml = safeMessage
      ? `<span class="hot-toast-message">${safeMessage}</span>`
      : "";

    return `
      ${icon}
      <div class="hot-toast-body">
        <span class="hot-toast-title">${safeTitle}</span>
        ${msgHtml}
      </div>
    `;
  };

  const show = (opts = {}) => {
    const container = getContainer();

    const {
      variant = "info",
      title,
      message,
      withIcon = true,
      html,
      toastify = {},
    } = opts;

    const v = normalizeVariant(variant);
    const el = document.createElement("div");
    el.className = "hot-toast";
    el.innerHTML = buildHtml({ variant: v, title, message, withIcon, html });

    const duration =
      typeof toastify.duration === "number"
        ? toastify.duration
        : defaults.duration;

    const style = { ...defaults.style, ...toastify.style };
    Object.assign(el.style, style);

    if (typeof toastify.onClick === "function") {
      el.addEventListener("click", (ev) => toastify.onClick(ev, el));
    }

    const dismiss = () => {
      if (el.classList.contains("exit")) return;
      el.classList.add("exit");
      el.addEventListener(
        "animationend",
        () => {
          if (el.parentElement) el.parentElement.removeChild(el);
        },
        { once: true }
      );
    };

    if (v !== "loading" && duration !== 0) {
      setTimeout(dismiss, Math.max(500, duration || defaults.duration));
    }

    container.appendChild(el);
    return { dismiss };
  };

  const setDefaults = (nextDefaults = {}) => {
    defaults = {
      ...defaults,
      ...nextDefaults,
      style: { ...defaults.style, ...nextDefaults.style },
    };
  };

  const getDefaults = () => ({
    ...defaults,
    style: { ...defaults.style },
  });

  const success = (title, message = "", toastify = {}) =>
    show({ variant: "success", title, message, toastify });
  const error = (title, message = "", toastify = {}) =>
    show({ variant: "error", title, message, toastify });
  const warning = (title, message = "", toastify = {}) =>
    show({ variant: "warning", title, message, toastify });
  const info = (title, message = "", toastify = {}) =>
    show({ variant: "info", title, message, toastify });

  return {
    show,
    success,
    error,
    warning,
    info,
    setDefaults,
    getDefaults,
  };
})();

// Exponer globalmente
window.ToastifyUtils = ToastifyUtils;
