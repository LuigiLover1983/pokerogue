import { BattlerIndex } from "#app/battle";
import { allMoves } from "#app/data/move";
import { Abilities } from "#enums/abilities";
import { Moves } from "#enums/moves";
import { Species } from "#enums/species";
import GameManager from "#test/utils/gameManager";
import Phaser from "phaser";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

describe("Moves - Dragon Tail", () => {
  let phaserGame: Phaser.Game;
  let game: GameManager;

  beforeAll(() => {
    phaserGame = new Phaser.Game({
      type: Phaser.HEADLESS,
    });
  });

  afterEach(() => {
    game.phaseInterceptor.restoreOg();
  });

  beforeEach(() => {
    game = new GameManager(phaserGame);
    game.override.battleType("single")
      .moveset([ Moves.DRAGON_TAIL, Moves.SPLASH, Moves.FLAMETHROWER ])
      .enemySpecies(Species.WAILORD)
      .enemyMoveset(Moves.SPLASH)
      .startingLevel(5)
      .enemyLevel(5);

    vi.spyOn(allMoves[Moves.DRAGON_TAIL], "accuracy", "get").mockReturnValue(100);
  });

  it("should cause opponent to flee, and not crash", async () => {
    await game.classicMode.startBattle([ Species.DRATINI ]);

    const enemyPokemon = game.scene.getEnemyPokemon()!;

    game.move.select(Moves.DRAGON_TAIL);

    await game.phaseInterceptor.to("BerryPhase");

    const isVisible = enemyPokemon.visible;
    const hasFled = enemyPokemon.switchOutStatus;
    expect(!isVisible && hasFled).toBe(true);

    // simply want to test that the game makes it this far without crashing
    await game.phaseInterceptor.to("BattleEndPhase");
  });

  it("should cause opponent to flee, display ability, and not crash", async () => {
    game.override.enemyAbility(Abilities.ROUGH_SKIN);
    await game.classicMode.startBattle([ Species.DRATINI ]);

    const leadPokemon = game.scene.getPlayerPokemon()!;
    const enemyPokemon = game.scene.getEnemyPokemon()!;

    game.move.select(Moves.DRAGON_TAIL);

    await game.phaseInterceptor.to("BerryPhase");

    const isVisible = enemyPokemon.visible;
    const hasFled = enemyPokemon.switchOutStatus;
    expect(!isVisible && hasFled).toBe(true);
    expect(leadPokemon.hp).toBeLessThan(leadPokemon.getMaxHp());
  });

  it("should proceed without crashing in a double battle", async () => {
    game.override
      .battleType("double").enemyMoveset(Moves.SPLASH)
      .enemyAbility(Abilities.ROUGH_SKIN);
    await game.classicMode.startBattle([ Species.DRATINI, Species.DRATINI, Species.WAILORD, Species.WAILORD ]);

    const leadPokemon = game.scene.getParty()[0]!;

    const enemyLeadPokemon = game.scene.getEnemyParty()[0]!;
    const enemySecPokemon = game.scene.getEnemyParty()[1]!;

    game.move.select(Moves.DRAGON_TAIL, 0, BattlerIndex.ENEMY);
    game.move.select(Moves.SPLASH, 1);

    await game.phaseInterceptor.to("TurnEndPhase");

    const isVisibleLead = enemyLeadPokemon.visible;
    const hasFledLead = enemyLeadPokemon.switchOutStatus;
    const isVisibleSec = enemySecPokemon.visible;
    const hasFledSec = enemySecPokemon.switchOutStatus;
    expect(!isVisibleLead && hasFledLead && isVisibleSec && !hasFledSec).toBe(true);
    expect(leadPokemon.hp).toBeLessThan(leadPokemon.getMaxHp());

    // second turn
    game.move.select(Moves.FLAMETHROWER, 0, BattlerIndex.ENEMY_2);
    game.move.select(Moves.SPLASH, 1);

    await game.phaseInterceptor.to("BerryPhase");
    expect(enemySecPokemon.hp).toBeLessThan(enemySecPokemon.getMaxHp());
  });

  it("should redirect targets upon opponent flee", async () => {
    game.override
      .battleType("double")
      .enemyMoveset(Moves.SPLASH)
      .enemyAbility(Abilities.ROUGH_SKIN);
    await game.classicMode.startBattle([ Species.DRATINI, Species.DRATINI, Species.WAILORD, Species.WAILORD ]);

    const leadPokemon = game.scene.getParty()[0]!;
    const secPokemon = game.scene.getParty()[1]!;

    const enemyLeadPokemon = game.scene.getEnemyParty()[0]!;
    const enemySecPokemon = game.scene.getEnemyParty()[1]!;

    game.move.select(Moves.DRAGON_TAIL, 0, BattlerIndex.ENEMY);
    // target the same pokemon, second move should be redirected after first flees
    game.move.select(Moves.DRAGON_TAIL, 1, BattlerIndex.ENEMY);

    await game.phaseInterceptor.to("BerryPhase");

    const isVisibleLead = enemyLeadPokemon.visible;
    const hasFledLead = enemyLeadPokemon.switchOutStatus;
    const isVisibleSec = enemySecPokemon.visible;
    const hasFledSec = enemySecPokemon.switchOutStatus;
    expect(!isVisibleLead && hasFledLead && !isVisibleSec && hasFledSec).toBe(true);
    expect(leadPokemon.hp).toBeLessThan(leadPokemon.getMaxHp());
    expect(secPokemon.hp).toBeLessThan(secPokemon.getMaxHp());
    expect(enemyLeadPokemon.hp).toBeLessThan(enemyLeadPokemon.getMaxHp());
    expect(enemySecPokemon.hp).toBeLessThan(enemySecPokemon.getMaxHp());
  });

  it("doesn't switch out if the target has suction cups", async () => {
    game.override.enemyAbility(Abilities.SUCTION_CUPS);
    await game.classicMode.startBattle([ Species.REGIELEKI ]);

    const enemy = game.scene.getEnemyPokemon()!;

    game.move.select(Moves.DRAGON_TAIL);
    await game.phaseInterceptor.to("TurnEndPhase");

    expect(enemy.isFullHp()).toBe(false);
  });

  it("should force a switch upon fainting an opponent normally", async () => {
    game.override.startingWave(5)
      .startingLevel(1000); // To make sure Dragon Tail KO's the opponent
    await game.classicMode.startBattle([ Species.DRATINI ]);

    game.move.select(Moves.DRAGON_TAIL);

    await game.toNextTurn();

    // Make sure the enemy switched to a healthy Pokemon
    const enemy = game.scene.getEnemyPokemon()!;
    expect(enemy).toBeDefined();
    expect(enemy.isFullHp()).toBe(true);

    // Make sure the enemy has a fainted Pokemon in their party and not on the field
    const faintedEnemy = game.scene.getEnemyParty().find(p => !p.isAllowedInBattle());
    expect(faintedEnemy).toBeDefined();
    expect(game.scene.getEnemyField().length).toBe(1);
  });

  it("should not cause a softlock when activating an opponent trainer's reviver seed", async () => {
    game.override.startingWave(5)
      .enemyHeldItems([{ name: "REVIVER_SEED" }])
      .startingLevel(1000); // To make sure Dragon Tail KO's the opponent
    await game.classicMode.startBattle([ Species.DRATINI ]);

    game.move.select(Moves.DRAGON_TAIL);

    await game.toNextTurn();

    // Make sure the enemy field is not empty and has a revived Pokemon
    const enemy = game.scene.getEnemyPokemon()!;
    expect(enemy).toBeDefined();
    expect(enemy.hp).toBe(Math.floor(enemy.getMaxHp() / 2));
    expect(game.scene.getEnemyField().length).toBe(1);
  });

  it("should not cause a softlock when activating a player's reviver seed", async () => {
    game.override.startingHeldItems([{ name: "REVIVER_SEED" }])
      .enemyMoveset(Moves.DRAGON_TAIL)
      .enemyLevel(1000); // To make sure Dragon Tail KO's the player
    await game.classicMode.startBattle([ Species.DRATINI, Species.BULBASAUR ]);

    game.move.select(Moves.SPLASH);

    await game.toNextTurn();

    // Make sure the player's field is not empty and has a revived Pokemon
    const dratini = game.scene.getPlayerPokemon()!;
    expect(dratini).toBeDefined();
    expect(dratini.hp).toBe(Math.floor(dratini.getMaxHp() / 2));
    expect(game.scene.getPlayerField().length).toBe(1);
  });
});
