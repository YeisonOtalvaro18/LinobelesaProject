export default function Addresses({ onNavigate }) {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button
          onClick={() => onNavigate && onNavigate('admin-dashboard')}
          aria-label="Volver al dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            background: 'transparent',
            border: '1px solid rgba(139,92,246,0.15)',
            padding: '10px 16px',
            borderRadius: 10,
            cursor: 'pointer',
            color: '#7c3aed',
            fontWeight: 500,
            boxShadow: 'none',
            marginBottom: 12,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(124,58,237,0.08)',
              color: '#7c3aed',
              fontSize: 14,
            }}
          >
            ←
          </span>
          <span style={{ fontSize: 14 }}>Volver al Dashboard</span>
        </button>
      </div>

      <div>Hola</div>
    </div>
  );
}
