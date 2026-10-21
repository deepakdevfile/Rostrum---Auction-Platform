import { api } from "@/lib/api"
import { RoomCard } from "@/components/RoomCard";

export default async function Home() {
  const rooms = await api.listRooms().catch(() => []);
  // console.log(rooms);
  const live = rooms.filter((r) => r.status === "live");
  // console.log(live);
  const upcoming = rooms.filter((r) => r.status === "scheduled");
  // console.log(upcoming);
  const closed = rooms.filter((r) => r.status === "ended" || r.status === "cancelled");
  // console.log(closed);

  return (
    <div>
      <section className="border-b border-hairline pb-10">
        <h1 className="max-w-2xl font-display text-5xl leading-[1.05] text-paper">
          The floor is open.
        </h1>
        <p className="mt-4 max-w-md text-dim">
          Bid live, watch the price move in real time, and see the seller on
          camera before the gavel falls.
        </p>
      </section>

      {live.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-2 font-display text-2xl text-paper">Live now</h2>
          <div>
            {live.map((room, i) => (
              <RoomCard key={room.id} room={room} index={i} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-2 font-display text-2xl text-paper">
            Opening soon
          </h2>
          <div>
            {upcoming.map((room, i) => (
              <RoomCard key={room.id} room={room} index={i} />
            ))}
          </div>
        </section>
      )}

      {closed.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-2 font-display text-2xl text-paper">
            Recently closed
          </h2>
          <div>
            {closed.map((room, i) => (
              <RoomCard key={room.id} room={room} index={i} />
            ))}
          </div>
        </section>
      )}

      {rooms.length === 0 && (
        <p className="mt-10 text-dim">
          No lots listed yet. Sign in and list to open the first floor.
        </p>
      )}
    </div>
  );
}
