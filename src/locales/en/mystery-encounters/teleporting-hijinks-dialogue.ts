export const teleportingHijinksDialogue = {
  intro: "It's a strange machine, whirring noisily...",
  title: "Teleportating Hijinks",
  description: "The machine has a sign on it that reads:\n  \"To use, insert money then step into the capsule.\"\n\nPerhaps it can transport you somewhere...",
  query: "What will you do?",
  option: {
    1: {
      label: "Put Money In",
      tooltip: "(-) Pay {{price, money}}\n(?) Teleport to New Biome",
      selected: "You insert some money, and the capsule opens.\nYou step inside...",
    },
    2: {
      label: "A Pokémon Helps",
      tooltip: "(-) {{option2PrimaryName}} Helps\n(+) {{option2PrimaryName}} gains EXP\n(?) Teleport to New Biome",
      selected: `{{option2PrimaryName}} uses its typing and overloads the machine!
        $The capsule opens, and you step inside...`
    },
    3: {
      label: "Inspect the Machine",
      tooltip: "(-) Pokémon Battle",
      selected: `You are drawn in by the blinking lights\nand strange noises coming from the machine...
        $You don't even notice as a wild\nPokémon sneaks up and ambushes you!`,
    },
  },
  transport: `The machine shakes violently,\nmaking all sorts of strange noises!
      $Just as soon as it had started, it quiets once more.`,
  attacked: `You step out into a completely new area, startling a wild Pokémon!
      $The wild Pokémon attacks!`,
  boss_enraged: "The opposing {{enemyPokemon}} has become enraged!"
};
