import React from "react";
import { getStatusBadgeClass } from "../utils/colorUtils";

/**
 * Componente riutilizzabile per visualizzare badge di stato
 *
 * @param {Object} props - Proprietà del componente
 * @param {string} props.status - Lo stato da visualizzare
 * @param {string} [props.label] - Etichetta opzionale da visualizzare (altrimenti usa lo stato)
 * @param {string} [props.className] - Classi aggiuntive
 * @returns {JSX.Element} Badge di stato
 */
const StatusBadge = ({ status, label, className = "" }) => {
  return (
    <span className={`${getStatusBadgeClass(status)} ${className}`}>
      {label || status.replace("_", " ")}
    </span>
  );
};

export default StatusBadge;
