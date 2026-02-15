"use client";
import { useEffect, useState } from "react";
import "./app.css";

type Person = {
  id: string;
  name: string;
  memo?: string;
};

const STORAGE_KEY = "humanbox-people-v1";

const Home = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftMemo, setDraftMemo] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>(() => {
    if (typeof window === "undefined") {
      return [
        { id: "1", name: "山田", memo: "陸上部" },
        { id: "2", name: "佐藤" },
        { id: "3", name: "鈴木", memo: "研究室" },
      ];
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [
        { id: "1", name: "山田", memo: "陸上部" },
        { id: "2", name: "佐藤" },
        { id: "3", name: "鈴木", memo: "研究室" },
      ];
    }
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  // [
  //   { id: "1", name: "山田", memo: "陸上部" },
  //   { id: "2", name: "佐藤" },
  //   { id: "3", name: "鈴木", memo: "研究室" },
  // ]);

  // useEffect(() => {
  //   const saved = localStorage.getItem(STORAGE_KEY);
  //   if (!saved) return;

  //   setPeople(JSON.parse(saved));
  // }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
  }, [people]);

  const addPerson = () => {
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name: "新しい人",
      memo: "仮メモ",
    };
    setPeople((prev) => [newPerson, ...prev]);
  };

  const removePerson = (id: string) => {
    setPeople((prev) => prev.filter((person) => person.id != id));
  };

  const startEdit = (person: Person) => {
    setEditingId(person.id);
    setDraftName(person.name);
    setDraftMemo(person.memo ?? "");
  };

  const saveMemo = () => {
    if (editingId === null) return;

    setPeople((prev) =>
      prev.map((p) =>
        p.id === editingId ? { ...p, name: draftName, memo: draftMemo } : p,
      ),
    );

    setEditingId(null);
    setDraftName("");
    setDraftMemo("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftMemo("");
  };

  return (
    <main>
      <h1>Human BOX</h1>

      <button onClick={addPerson} className="btn">
        +追加
      </button>

      <ul className="peopleList">
        {people.map((person) => (
          <li
            key={person.id}
            className={`personCard ${selectedId === person.id ? "active" : ""}`}
            onClick={() =>
              setSelectedId((prev) => (prev === person.id ? null : person.id))
            }
          >
            <div className="personName">{person.name}</div>
            <div className="personMemo">
              {person.memo ?? " クリックしてメモを書く "}
            </div>
          </li>
        ))}

        {selectedId && (
          <div className="overlay" onClick={() => setSelectedId(null)}>
            <div className="modalCard" onClick={(e) => e.stopPropagation()}>
              {people
                .filter((p) => p.id === selectedId)
                .map((p) => (
                  <div key={p.id} className="modalInner">
                    <div className="personMain">
                      {editingId === p.id ? (
                        <>
                          <input
                            className="nameInput"
                            value={draftName}
                            onChange={(e) => setDraftName(e.target.value)}
                          />
                          <textarea
                            className="memoInput"
                            value={draftMemo}
                            onChange={(e) => setDraftMemo(e.target.value)}
                            autoFocus
                            rows={3}
                          />
                        </>
                      ) : (
                        <>
                          <div className="personName">{p.name}</div>
                          <div className="personMemo">
                            {p.memo ?? " クリックしてメモを書く "}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="personActions">
                      {editingId === p.id ? (
                        <div className="editActions">
                          <button className="btn" onClick={saveMemo}>
                            保存
                          </button>

                          <button
                            className="btn"
                            onClick={() => setEditingId(null)}
                          >
                            キャンセル
                          </button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => startEdit(p)} className="btn">
                            メモを編集
                          </button>
                          <button
                            onClick={() => removePerson(p.id)}
                            className="btn danger"
                          >
                            削除
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </ul>
    </main>
  );
};

export default Home;
