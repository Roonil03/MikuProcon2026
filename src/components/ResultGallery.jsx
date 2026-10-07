import { useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';

const WARM_GOLD = 'rgba(230, 199, 137, 1)';
const COOL_BLUE = 'rgba(143, 199, 234, 1)';

const PolaroidCard = ({ lyric, index }) => {
  const rotation = (index % 2 === 0 ? -1 : 1) * (2 + ((index * 37) % 40) / 10);

  return (
    <div style={{
      display: 'inline-block',
      background: '#fdfdfd',
      padding: '12px 12px 40px 12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
      transform: `rotate(${rotation}deg)`,
      margin: '10px',
      minWidth: '120px',
      textAlign: 'center',
      transition: 'transform 0.3s ease',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(230,199,137,0.15) 0%, #1a1a2e 50%, rgba(143,199,234,0.15) 100%)',
        padding: '20px',
        minHeight: '80px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at center, rgba(230,199,137,0.15) 0%, transparent 70%)',
        }} />
        <span style={{
          fontSize: '1.8rem',
          fontWeight: 700,
          fontFamily: '"Zen Kaku Gothic New", sans-serif',
          color: WARM_GOLD,
          textShadow: '0 0 12px rgba(230,199,137,0.6)',
          letterSpacing: '2px',
          position: 'relative',
          zIndex: 1,
        }}>
          {lyric.text}
        </span>
      </div>
      <div style={{
        marginTop: '8px',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '0.7rem',
        color: '#888',
        textAlign: 'left',
      }}>
        SHUTTER CHANCE / {String(Math.floor(lyric.startTime / 60000)).padStart(2, '0')}:{String(Math.floor((lyric.startTime % 60000) / 1000)).padStart(2, '0')}
      </div>
    </div>
  );
};

export const ResultGallery = () => {
  const galleryRef = useRef(null);
  const capturedLyrics = useStore(state => state.capturedLyrics);
  const score = useStore(state => state.score);
  const language = useStore(state => state.language);

  const bodyFont = language === 'ja'
    ? '"Shizuru", system-ui'
    : '"Kranky", sans-serif';

  const handleDownload = useCallback(async () => {
    if (!galleryRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(galleryRef.current, {
        backgroundColor: '#0a0a0f',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = 'shutter-chance-archive.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // Silent fallback
    }
  }, []);

  const handleRestart = useCallback(() => {
    const msg = language === 'ja' 
      ? '曲をリスタートしてもよろしいですか？（進捗は失われます）'
      : 'Would you like to play the song again?';
    if (window.confirm(msg)) {
      window.location.reload();
    }
  }, [language]);

  if (capturedLyrics.length === 0) {
    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 100,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        background: 'rgba(10,10,15,0.95)',
        color: '#aaa',
        fontFamily: bodyFont,
      }}>
        <h2 style={{ marginBottom: '10px', color: '#fff', fontFamily: '"Kranky", sans-serif', fontSize: '2rem' }}>
          {language === 'ja' ? '\u30AD\u30E3\u30D7\u30C1\u30E3\u306A\u3057' : 'No Captures'}
        </h2>
        <p>{language === 'ja' ? '\u3053\u306E\u30BB\u30C3\u30B7\u30E7\u30F3\u3067\u306F\u6B4C\u8A5E\u304C\u30AD\u30E3\u30D7\u30C1\u30E3\u3055\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002' : 'No lyrics were captured during this session.'}</p>
        <button
          onClick={handleRestart}
          style={{
            marginTop: '20px',
            padding: '14px 36px',
            fontSize: language === 'ja' ? '0.85rem' : '1.1rem',
            fontFamily: language === 'ja' ? '"Shizuru", system-ui' : '"Kranky", sans-serif',
            background: 'transparent',
            color: COOL_BLUE,
            border: `1px solid ${COOL_BLUE}`,
            cursor: 'pointer',
            letterSpacing: '3px',
          }}
        >
          {language === 'ja' ? '曲をリスタート' : 'Restart Song'}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 100,
      display: 'flex', flexDirection: 'column',
      background: 'rgba(10,10,15,0.97)',
      color: 'white',
      fontFamily: bodyFont,
      overflow: 'auto',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '30px 20px 10px',
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 400,
          fontFamily: '"Kranky", sans-serif',
          letterSpacing: '4px',
          marginBottom: '8px',
          color: WARM_GOLD,
        }}>
          Roonil03
        </h1>
        <p style={{ color: '#888', fontSize: language === 'ja' ? '0.85rem' : '1rem', fontFamily: bodyFont }}>
          {language === 'ja'
            ? `\u6700\u7D42\u30B9\u30B3\u30A2: ${score} | \u30AD\u30E3\u30D7\u30C1\u30E3: ${capturedLyrics.length}\u30D5\u30EC\u30FC\u30E0`
            : `Final Score: ${score} | Captured: ${capturedLyrics.length} frames`}
        </p>
      </div>

      <div
        ref={galleryRef}
        style={{
          flex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '20px',
          gap: '6px',
          backgroundColor: '#0a0a0f',
        }}
      >
        {capturedLyrics.map((lyric, i) => (
          <PolaroidCard key={lyric.id} lyric={lyric} index={i} />
        ))}
      </div>

      <div style={{
        textAlign: 'center',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={handleDownload}
          style={{
            padding: '14px 36px',
            fontSize: language === 'ja' ? '0.85rem' : '1.1rem',
            fontFamily: language === 'ja' ? '"Shizuru", system-ui' : '"Kranky", sans-serif',
            fontWeight: 400,
            background: 'transparent',
            color: WARM_GOLD,
            border: `1px solid ${WARM_GOLD}`,
            cursor: 'pointer',
            letterSpacing: '3px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = WARM_GOLD;
            e.target.style.color = '#0a0a0f';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = WARM_GOLD;
          }}
        >
          {language === 'ja' ? 'アーカイブをダウンロード' : 'Download Archive'}
        </button>

        <button
          onClick={handleRestart}
          style={{
            padding: '14px 36px',
            fontSize: language === 'ja' ? '0.85rem' : '1.1rem',
            fontFamily: language === 'ja' ? '"Shizuru", system-ui' : '"Kranky", sans-serif',
            fontWeight: 400,
            background: 'transparent',
            color: COOL_BLUE,
            border: `1px solid ${COOL_BLUE}`,
            cursor: 'pointer',
            letterSpacing: '3px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = COOL_BLUE;
            e.target.style.color = '#0a0a0f';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = COOL_BLUE;
          }}
        >
          {language === 'ja' ? '曲をリスタート' : 'Restart Song'}
        </button>
      </div>
    </div>
  );
};
