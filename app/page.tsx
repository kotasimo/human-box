"use client";
import { useState } from "react";
import "./app.css";

type Person = {
  id: string;
  name: string;
  memo?: string;
};

const Home = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftMemo, setDraftMemo] = useState("");it
  const [people, setPeople] = useState<Person[]>([
    { id: "1", name: "山田", memo: "陸上部" },
    { id: "2", name: "佐藤" },
    { id: "3", name: "鈴木", memo: "研究室" },
  ]);

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
    setDraftMemo(person.memo ?? "");
  };

  const saveMemo = () => {
    if (editingId === null) return;

    setPeople((prev) =>
      prev.map((p) => (p.id === editingId ? { ...p, memo: draftMemo } : p)),
    );

    setEditingId(null);
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
          <li key={person.id} className="personCard">
            <div className="personMain">
              <div className="personName">{person.name}</div>
              {/* {person.memo && <span>({person.memo})</span>} */}
              {editingId === person.id ? (
                <textarea
                  className="memoInput"
                  value={draftMemo}
                  onChange={(e) => setDraftMemo(e.target.value)}
                  autoFocus
                  rows={3}
                />
              ) : (
                <div className="personMemo">
                  {person.memo ?? " クリックしてメモを書く "}
                </div>

              )}
            </div>

            <div className="personActions">
              {editingId === person.id ? (
                <div className="editActions">
                  <button className="btn" onClick={saveMemo}>
                    保存
                  </button>

                  <button className="btn" onClick={() => setEditingId(null)}>
                    キャンセル
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => startEdit(person)} className="btn">
                    メモを編集
                  </button>
                  <button
                    onClick={() => removePerson(person.id)}
                    className="btn danger"
                  >
                    削除
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default Home;
