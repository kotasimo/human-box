"use client";
import { useEffect, useRef, useState } from "react";
import "./app.css";
import { useRouter } from "next/navigation";

type Person = {
  id: string;
  name: string;
  memo?: string;
};

const STORAGE_KEY = "humanbox-people-v1";

const DEFAULT_PEOPLE: Person[] = [
  { id: "1", name: "山田", memo: "陸上部" },
  { id: "2", name: "佐藤" },
  { id: "3", name: "鈴木", memo: "研究室" },
];

// AIが書いた。理解は後回し。localStorageに不正な値が入ったときの処理らしい
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
      return hasValidId && hasValidName && hasValidMemo;
    })
  );
};

const Home = () => {
  const router = useRouter();

  const [people, setPeople] = useState<Person[] | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        setPeople(isPersonArray(parsed) ? parsed : DEFAULT_PEOPLE);
      } else {
        setPeople(DEFAULT_PEOPLE);
      }
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

  if (people === null) {
    return <div>Loading....</div>;
  }

  const addPerson = () => {
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name: "新しい人",
      memo: "",
    };
    setPeople((prev) => [newPerson, ...prev]);
  };

  const removePerson = (id: string) => {
    setPeople((prev) => prev.filter((person) => person.id != id));
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
            className="personCard"
            onClick={() => router.push(`/person/${person.id}`)}
            role="button"
            tabIndex={0}
          >
            <div className="personName">{person.name}</div>
            <div className="personMemo">
              {person.memo?.trim() ? person.memo : " クリックしてメモを書く "}
            </div>

          </li>
        ))}
      </ul>
    </main>
  );
};

export default Home;
