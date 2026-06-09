import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useAnalytics(workspaceId) {
  const [logs, setLogs] = useState([]);
  const [qrcodes, setQrcodes] = useState([]);
  const [smartlinks, setSmartlinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) {
      setLogs([]);
      setQrcodes([]);
      setSmartlinks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const qLogs = query(collection(db, 'analytics'), where('workspaceId', '==', workspaceId));
    const qQr = query(collection(db, 'qrcodes'), where('workspaceId', '==', workspaceId));
    const qSl = query(collection(db, 'smartlinks'), where('workspaceId', '==', workspaceId));

    let resolvedCount = 0;
    const checkDone = () => {
      if (resolvedCount === 3) setLoading(false);
    };

    const unsubLogs = onSnapshot(qLogs, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLogs(data);
      if (resolvedCount < 3) { resolvedCount++; checkDone(); }
    });

    const unsubQr = onSnapshot(qQr, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setQrcodes(data);
      if (resolvedCount < 3) { resolvedCount++; checkDone(); }
    });

    const unsubSl = onSnapshot(qSl, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSmartlinks(data);
      if (resolvedCount < 3) { resolvedCount++; checkDone(); }
    });

    return () => {
      unsubLogs();
      unsubQr();
      unsubSl();
    };
  }, [workspaceId]);

  return { logs, qrcodes, smartlinks, loading };
}
