"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "../../app.css";

type ProfileItem = { label: string; value: string };

type Person = {
  id: string;
  name: string;
  profile?: ProfileItem[];
  memo?: string;
};

const STORAGE_KEY = "humanbox-people-v1";

const DEFAULT_PEOPLE: Person[] = [
  {
    id: "1",
    name: "山田",
    profile: [
      { label: "部活", value: "陸上部" },
      { label: "関係", value: "友達" },
    ],
    memo: "陸上部",
  },
  { id: "2", name: "佐藤" },
  { id: "3", name: "鈴木", memo: "研究室" },
];

const isPersonArray = (value: unknown): value is Person[] => {
  return (
    Array.isArray(value) &&
    value.every((item) => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Record<string, unknown>;
      const hasValidId = typeof candidate.id === "string";
      const hasValidName = typeof candidate.name === "string";
      const hasValidMemo =
        candidate.memo === undefined || typeof candidate.memo === "string";
      const profile = candidate.profile;

      let hasValidProfile = true;

      if (profile !== undefined) {
        if (!Array.isArray(profile)) return false;

        hasValidProfile = profile.every((p) => {
          if (!p || typeof p !== "object") return false;
          const entry = p as Record<string, unknown>;
          return (
            typeof entry.label === "string" && typeof entry.value === "string"
          );
        });
      }

      return hasValidId && hasValidName && hasValidMemo;
    })
  );
};

const PersonPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftMemo, setDraftMemo] = useState("");
  const [people, setPeople] = useState<Person[] | null>(null);

  const hasLoadedRef = useRef(false);

  // localStorage から people を読む（Homeと同じ）
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setPeople(DEFAULT_PEOPLE);
        return;
      }
      const parsed = JSON.parse(saved) as unknown;
      setPeople(isPersonArray(parsed) ? parsed : DEFAULT_PEOPLE);
    } catch {
      setPeople(DEFAULT_PEOPLE);
    } finally {
      hasLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    if (people === null) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
  }, [people]);

  // people が読めた後に、対象の person を探す
  const person = useMemo(() => {
    if (people === null) return null;
    return people.find((p) => p.id === id) ?? null;
  }, [people, id]);

  if (people === null) {
    return <div>Loading...</div>;
  }

  if (person === null) {
    return (
      <main>
        <h1>Not Found</h1>
      </main>
    );
  }

  const profile = person.profile ?? [];

  const removePerson = (id: string) => {
    setPeople((prev) =>
      prev ? prev.filter((person) => person.id != id) : prev,
    );
    if (editingId === id) {
      setEditingId(null);
      setDraftName("");
      setDraftMemo("");
    }
    router.push("/");
  };

  const startEdit = (person: Person) => {
    setEditingId(person.id);
    setDraftName(person.name);
    setDraftMemo(person.memo ?? "");
  };

  const saveMemo = () => {
    if (editingId === null) return;

    setPeople((prev) =>
      prev
        ? prev.map((p) =>
            p.id === editingId ? { ...p, name: draftName, memo: draftMemo } : p,
          )
        : prev,
    );

    setEditingId(null);
    setDraftName("");
    setDraftMemo("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftName(person.name);
    setDraftMemo(person.memo ?? "");
  };

  return (
    <main>
      <h1>Person Page</h1>

      <div className="personMain">
        {editingId === person.id ? (
          <>
            <input
              className="personNameEdit"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
            />
            <textarea
              className="personMemoEdit"
              value={draftMemo}
              onChange={(e) => setDraftMemo(e.target.value)}
              autoFocus
              rows={3}
            />
            <div className="editActions">
              <button className="btn" onClick={saveMemo}>
                保存
              </button>

              <button className="btn" onClick={cancelEdit}>
                キャンセル
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="personNameId">{person.name}</div>

            <div className="profileBox">
              {profile.length === 0 ? (
                <div className="profileEmpty">プロフィール未設定</div>
              ) : (
                profile.map((item, i) => (
                  <div key={i} className="profileRow">
                    <div className="profileLabel">・{item.label}</div>
                    <div className="profileValue">{item.value}</div>
                  </div>
                ))
              )}
            </div>

            <div className="personMemoId">
              {person.memo ?? " クリックしてメモを書く "}
            </div>
            <div className="personAction">
              <button onClick={() => router.push("/")} className="btn">
                戻る
              </button>
              <button onClick={() => startEdit(person)} className="btn">
                メモを編集
              </button>
              <button
                onClick={() => removePerson(person.id)}
                className="btn danger"
              >
                削除
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default PersonPage;
