import { useState, useEffect, useRef } from 'react';
import { collection, query, where, or, onSnapshot, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export function useWorkspaces(currentUser) {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);
  const hasAttemptedCreatePersonal = useRef(false);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "workspaces"), 
      or(
        where("ownerId", "==", currentUser.uid),
        where("members", "array-contains", currentUser.uid)
      )
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      let wks = [];
      querySnapshot.forEach((docSnap) => {
        // Jednorazowe czyszczenie starych, wadliwych przestrzeni osobistych
        if (docSnap.data().name === "Personal" && docSnap.data().type !== "personal") {
           deleteDoc(docSnap.ref).catch(console.error);
        } else {
           wks.push({ id: docSnap.id, ...docSnap.data() });
        }
      });

      const hasPersonal = wks.some(w => w.type === "personal" || w.name === "Personal");

      // Automatyczne utworzenie nowej przestrzeni, jeśli nie istnieje
      if (!hasPersonal && !hasAttemptedCreatePersonal.current) {
        hasAttemptedCreatePersonal.current = true;
        
        const defaultGradients = [
          'linear-gradient(to top right, #FF4C00, #9333ea)',
          'linear-gradient(to bottom right, #3b82f6, #8b5cf6)',
          'linear-gradient(to bottom right, #10b981, #3b82f6)',
          'linear-gradient(to bottom right, #f59e0b, #ef4444)'
        ];
        const randomGradient = defaultGradients[Math.floor(Math.random() * defaultGradients.length)];
        const defaultName = currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Osobisty');

        try {
          const docRef = await addDoc(collection(db, "workspaces"), {
            name: defaultName,
            ownerId: currentUser.uid,
            type: "personal",
            avatarStyle: randomGradient,
            createdAt: serverTimestamp(),
            allowMembersEdit: false,
            allowMembersArchive: false,
            allowMembersReset: false
          });
          wks.push({ id: docRef.id, name: defaultName, type: "personal", ownerId: currentUser.uid, avatarStyle: randomGradient });
        } catch (e) {
          console.error("Błąd zapisu do Firestore:", e);
        }
      }

      setWorkspaces(wks);

      // Jeśli nie ma aktywnego workspace'u (np. przy wczytywaniu), spróbuj ustawić personalny
      setActiveWorkspace(prev => {
        if (!prev) {
          return wks.find(w => w.type === 'personal' || w.name === 'Personal') || wks[0] || null;
        }
        // Aktualizuj bieżący workspace (np. jeśli zmieniła się w nim nazwa)
        return wks.find(w => w.id === prev.id) || wks[0] || null;
      });
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.email) return;

    const invitesQ = query(
      collection(db, "invites"),
      where("email", "==", currentUser.email),
      where("status", "==", "pending")
    );

    const unsubscribeInvites = onSnapshot(invitesQ, (snapshot) => {
      const invs = [];
      snapshot.forEach(docSnap => {
        invs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setPendingInvites(invs);
    });

    return () => unsubscribeInvites();
  }, [currentUser?.email]);

  return { workspaces, activeWorkspace, setActiveWorkspace, pendingInvites };
}
