import React from "react";


export default function AdminNotifications({ onNavigate }) {
    const handleBackToDashboard = () => {
        if (onNavigate) {
            onNavigate("admin-dashboard");
        }
    };
    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Notificaciones (Admin)</h1>
                <button style={styles.button} onClick={handleBackToDashboard}>
                    Volver al dashboard
                </button>
            </header>

            <main style={styles.main}>
                {/* Aquí puedes listar las notificaciones o el contenido que necesites */}
                <p>No hay notificaciones por el momento.</p>
            </main>
        </div>
    );
}

const styles = {
    container: {
        padding: 20,
        fontFamily: "Arial, sans-serif",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        margin: 0,
        fontSize: 20,
    },
    button: {
        background: "#2563eb",
        color: "#fff",
        border: "none",
        padding: "8px 12px",
        borderRadius: 6,
        cursor: "pointer",
    },
    main: {
        background: "#f9fafb",
        padding: 16,
        borderRadius: 6,
    },
};