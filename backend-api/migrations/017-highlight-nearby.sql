-- Add NEARBY type to place_highlight for "Khoảng cách đến điểm vui chơi nổi bật"
ALTER TABLE place_highlight
  DROP CONSTRAINT ck_place_highlight_type;

ALTER TABLE place_highlight
  ADD CONSTRAINT ck_place_highlight_type
    CHECK (type IN ('PRO', 'CON', 'TIP', 'PAIN_POINT', 'NEARBY'));
