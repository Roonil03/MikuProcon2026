import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { useStore } from "../src/store/useStore.js";

beforeEach(() => {
  useStore.getState().reset();
});

describe("game store", () => {
  it("captures each lyric only once", () => {
    useStore.getState().setLyricsData([{ id: 7, text: "ミ", startTime: 1000 }]);

    useStore.getState().captureLyric(7);
    useStore.getState().captureLyric(7);

    assert.deepEqual(useStore.getState().capturedLyrics.map(lyric => lyric.id), [7]);
  });

  it("clamps shutter speed to the playable range", () => {
    useStore.getState().setShutterSpeed(99);
    assert.equal(useStore.getState().shutterSpeed, 3);

    useStore.getState().setShutterSpeed(-1);
    assert.equal(useStore.getState().shutterSpeed, 0.1);
  });

  it("sets and resets optional gameplay state", () => {
    useStore.getState().setArMode(true);
    useStore.getState().setOrientationPermission("granted");
    useStore.getState().setInstrumentalGaps([{ startTime: 10, endTime: 20 }]);
    useStore.getState().reset();

    assert.equal(useStore.getState().arMode, false);
    assert.equal(useStore.getState().orientationPermission, "unknown");
    assert.deepEqual(useStore.getState().instrumentalGaps, []);
  });
});
