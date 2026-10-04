import React, { useState, useEffect } from 'react';

export default function App() {
  const [queues, setQueues] = useState({ SP: [], SE: [], SG: [] });
  const [counters, setCounters] = useState({ SP: 1, SE: 1, SG: 1 });
  const [recentCalled, setRecentCalled] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [guichê, setGuiché] = useState('01');

  // Regra de alternância: alterna entre SP e (SE/SG)
  const [lastPriority, setLastPriority] = useState('SG');

  // Gerar numeração no padrão YYMMDD-PPSQ
  const generateTicketNumber = (type) => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const sq = String(counters[type]).padStart(3, '0');
    return `${yy}${mm}${dd}-${type}${sq}`;
  };

  // Emissão de senha pelo Totem (Agente Cliente)
  const handleIssueTicket = (type) => {
    const number = generateTicketNumber(type);
    const newTicket = {
      number,
      type,
      status: 'EMITIDA',
      issuedAt: new Date().toLocaleTimeString(),
    };

    setQueues((prev) => ({ ...prev, [type]: [...prev[type], newTicket] }));
    setCounters((prev) => ({ ...prev, [type]: prev[type] + 1 }));
  };

  // Chamada do próximo cliente pelo Atendente (Agente Atendente)
  const handleCallNext = () => {
    let selectedType = null;

    if (lastPriority === 'SP') {
      if (queues.SE.length > 0) selectedType = 'SE';
      else if (queues.SG.length > 0) selectedType = 'SG';
      else if (queues.SP.length > 0) selectedType = 'SP';
    } else {
      if (queues.SP.length > 0) selectedType = 'SP';
      else if (queues.SE.length > 0) selectedType = 'SE';
      else if (queues.SG.length > 0) selectedType = 'SG';
    }

    if (!selectedType) {
      alert('Não há senhas na fila!');
      return;
    }

    const ticketToCall = queues[selectedType][0];
    const updatedTicket = { ...ticketToCall, status: 'CHAMADA', guiche: guichê };

    // Atualiza filas
    setQueues((prev) => ({
      ...prev,
      [selectedType]: prev[selectedType].slice(1),
    }));

    setCurrentTicket(updatedTicket);
    setLastPriority(selectedType);

    // Atualiza as 5 últimas chamadas no painel
    setRecentCalled((prev) => [updatedTicket, ...prev].slice(0, 5));
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>nassauTickets - Sistema de Controle de Atendimento</h1>
      <hr />

      {/* Visão do Totem */}
      <section style={{ marginBottom: '30px', background: '#f4f4f4', padding: '15px', borderRadius: '8px' }}>
        <h2>Totem de Emissão (Cliente)</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleIssueTicket('SP')} style={{ padding: '10px 15px', cursor: 'pointer' }}>
            Emitir Prioritária (SP)
          </button>
          <button onClick={() => handleIssueTicket('SE')} style={{ padding: '10px 15px', cursor: 'pointer' }}>
            Emitir Retirada de Exames (SE)
          </button>
          <button onClick={() => handleIssueTicket('SG')} style={{ padding: '10px 15px', cursor: 'pointer' }}>
            Emitir Geral (SG)
          </button>
        </div>
      </section>

      {/* Visão do Painel de Chamadas */}
      <section style={{ marginBottom: '30px', background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
        <h2>Painel de Chamadas Público</h2>
        <h3>Última Chamada: {currentTicket ? `${currentTicket.number} - Guichê ${currentTicket.guiche}` : '---'}</h3>
        <h4>Últimas 5 Senhas Chamadas:</h4>
        <ul>
          {recentCalled.map((t, idx) => (
            <li key={idx}>
              <strong>{t.number}</strong> - Guichê {t.guiche} ({t.type})
            </li>
          ))}
        </ul>
      </section>

      {/* Visão do Atendente */}
      <section style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px' }}>
        <h2>Terminal do Atendente</h2>
        <label>
          Guichê Atual: 
          <input 
            type="text" 
            value={guichê} 
            onChange={(e) => setGuiché(e.target.value)} 
            style={{ marginLeft: '10px', width: '50px' }} 
          />
        </label>
        <br /><br />
        <button onClick={handleCallNext} style={{ padding: '10px 20px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Chamar Próxima Senha
        </button>

        <div style={{ marginTop: '15px' }}>
          <p><strong>Fila SP:</strong> {queues.SP.length} aguardando</p>
          <p><strong>Fila SE:</strong> {queues.SE.length} aguardando</p>
          <p><strong>Fila SG:</strong> {queues.SG.length} aguardando</p>
        </div>
      </section>
    </div>
  );
}

