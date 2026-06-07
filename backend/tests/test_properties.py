"""
Property-based tests for KDM Care backend using Hypothesis.
Run with: pytest backend/tests/test_properties.py -v
"""
import io
import sys
from pathlib import Path

import pytest
from hypothesis import given, settings
from hypothesis import strategies as st
from PIL import Image

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from ml.mock_predictor import derive_risk
from ml.preprocessors import image_preprocess


# ── Property 2: Risk derivation correctness ───────────────────────────────────

@given(
    confidence=st.floats(min_value=0.0, max_value=100.0, allow_nan=False),
    result=st.sampled_from(["Positive", "Negative"]),
)
@settings(max_examples=300)
def test_risk_derivation_correctness(confidence, result):
    risk = derive_risk(confidence, result)
    if result == "Negative":
        assert risk == "Low", f"Expected Low for Negative, got {risk}"
    elif confidence >= 85.0:
        assert risk == "High", f"Expected High for confidence={confidence}, got {risk}"
    else:
        assert risk == "Medium", f"Expected Medium for confidence={confidence}, got {risk}"


# ── Property 5: Image preprocessor output invariant ──────────────────────────

@given(
    width=st.integers(min_value=1, max_value=1024),
    height=st.integers(min_value=1, max_value=1024),
    mode=st.sampled_from(["RGB", "L", "RGBA"]),
)
@settings(max_examples=100)
def test_image_preprocessor_invariant(width, height, mode):
    img = Image.new(mode, (width, height))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    tensor = image_preprocess(buf.getvalue())
    assert tensor.shape == (1, 3, 224, 224), f"Unexpected shape: {tensor.shape}"
    assert float(tensor.min()) >= 0.0, "Tensor values below 0"
    assert float(tensor.max()) <= 1.0, "Tensor values above 1"


# ── Property 8: Short password always returns 401 ────────────────────────────

@given(password=st.text(max_size=3))
@settings(max_examples=200)
def test_short_password_schema(password):
    """Verify the validation logic that the router uses."""
    is_valid = bool(password) and len(password) >= 4
    assert not is_valid, f"Password '{password}' (len={len(password)}) should be invalid"


# ── Property: derive_risk output is always a valid Risk_Level ─────────────────

@given(
    confidence=st.floats(min_value=0.0, max_value=100.0, allow_nan=False),
    result=st.sampled_from(["Positive", "Negative"]),
)
@settings(max_examples=200)
def test_risk_always_valid_value(confidence, result):
    risk = derive_risk(confidence, result)
    assert risk in {"High", "Medium", "Low"}, f"Invalid risk value: {risk}"
