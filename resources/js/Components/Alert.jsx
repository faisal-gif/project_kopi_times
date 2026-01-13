import { useState } from "react";
import {
    CheckCircleIcon,
    XCircleIcon,
    AlertTriangleIcon,
    InfoIcon,
    XIcon,
} from "lucide-react";

const TYPES = {
    success: {
        class: "alert-success",
        icon: CheckCircleIcon,
    },
    error: {
        class: "alert-error",
        icon: XCircleIcon,
    },
    warning: {
        class: "alert-warning",
        icon: AlertTriangleIcon,
    },
    info: {
        class: "alert-info",
        icon: InfoIcon,
    },
};

export default function Alert({
    type = "info",
    title,
    message,
    dismissible = false,
    icon: CustomIcon,
    children,
    className = "",
}) {
    const [open, setOpen] = useState(true);

    if (!open) return null;

    const config = TYPES[type] || TYPES.info;
    const Icon = CustomIcon || config.icon;

    return message ? (
        <div
            className={`alert ${config.class} shadow-sm flex items-start gap-3 ${className}`}
        >
            {/* ICON */}
            <Icon className="w-5 h-5 mt-0.5 shrink-0" />

            {/* CONTENT */}
            <div className="flex-1 space-y-1">
                {title && <h3 className="font-bold">{title}</h3>}
                {message && <p className="text-sm">{message}</p>}
                {children}
            </div>

            {/* CLOSE */}
            {dismissible && (
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn btn-ghost btn-xs"
                >
                    <XIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    ) : null;
}
