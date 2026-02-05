import { useEffect, useState } from "react";

export default function ReserveModal({ open, onClose, onConfirm, summary }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (open) {
      setFullName("");
      setEmail("");
      setPhone("");
    }
  }, [open]);

  if (!open) return null;

  function submit(e) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      alert("Por favor completa todos los campos.");
      return;
    }
    onConfirm?.({ fullName, email, phone });
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Reserva">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>

        <h3>Reservar</h3>
        <p>{summary || "—"}</p>

        <form onSubmit={submit}>
          <label>
            Nombre completo
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>

          <label>
            Correo electrónico
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label>
            Número de teléfono
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Confirmar reserva</button>
          </div>
        </form>
      </div>
    </div>
  );
}
