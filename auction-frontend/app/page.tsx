import Image from "next/image";

export default function Home() {
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
      <section className="mt-10">
        <h2 className="mb-2 font-display text-2xl text-paper">Live now</h2>
        <div>live bids</div>
      </section>
      <section className="mt-10">
        <h2 className="mb-2 font-display text-2xl text-paper">Opening soon</h2>
        <div>upcoming bids</div>
      </section>
      <section className="mt-10">
        <h2 className="mb-2 font-display text-2xl text-paper">
          Recently closed
        </h2>
        <div>closed bids</div>
      </section>
      <p className="mt-10 text-dim">
        No lots listed yet. Sign in and list to open the first floor.
      </p>
    </div>
  );
}
