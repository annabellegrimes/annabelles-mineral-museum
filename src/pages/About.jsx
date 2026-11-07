import { useEffect } from 'react';
import StatusBadge from '../components/StatusBadge.jsx';
import { STATUS, STATUS_ORDER } from '../lib/catalogue.js';

export default function About() {
  useEffect(() => { document.title = "About — Annabelle's Mineral Museum"; }, []);
  return (
    <div className="wrap prose">
      <h1>About the museum</h1>
      <p>
        This is a digital catalogue of my personal rock, gem, and mineral collection. Each specimen gets a permanent
        catalogue number (<span className="mono">ROCK-0001</span>, <span className="mono">ROCK-0002</span>, …), photographs,
        and — where the scan cooperates — an interactive 3D model made with an iPhone and Polycam.
      </p>

      <h2>How to read a label</h2>
      <p>
        A lot of a rock collection is educated guesswork, so every specimen states how sure I am about what it is.
      </p>
      <ul className="legend">
        {STATUS_ORDER.map((st) => (
          <li key={st}><span><StatusBadge status={st} /></span><span>{STATUS[st].blurb}</span></li>
        ))}
      </ul>
      <p>
        Specimen pages keep three kinds of information apart: <strong>my records and observations</strong> of the
        specimen itself; <strong>general reference properties</strong> of the mineral species (clearly marked, and
        never measurements of my specimen); and <strong>speculation</strong>, such as possible localities, which is
        always shown with its supporting evidence, a confidence level and the alternatives.
      </p>

      <h2>On provenance</h2>
      <p>
        Most of these specimens arrived without reliable locality information. Knowing that a mineral is commonly
        found in a particular place does not tell us where a given specimen came from, so a locality only counts as
        documented when there is a record of it — a dealer's label, a receipt, or my own field notes. Everything else
        is a hypothesis.
      </p>

      <h2>About the 3D scans</h2>
      <p>
        The models are photogrammetry scans made with Polycam on an iPhone. Photogrammetry works best on matte,
        opaque surfaces. Translucent crystals, reflective faces, and fine needle-like sprays confuse it, so some models
        will look softer, blurrier or lumpier than the real thing. The photographs remain the reference for colour
        and fine detail. The viewer's <em>Scan colours</em> mode shows a model's captured texture without added lighting.
      </p>

      <h2>Coming eventually</h2>
      <p>
        A map of documented and possible origins, an identification lab for the mystery rocks, side-by-side
        comparisons, an acquisition timeline, and a virtual shelf. For now: the gallery and the scans.
      </p>
    </div>
  );
}
