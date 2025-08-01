import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface LanguagePair {
  id: string;
  user_id: string;
  from_lang: string;
  to_lang: string;
  created_at: string;
}

interface LanguagePairsState {
  pairs: LanguagePair[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: LanguagePairsState = {
  pairs: [],
  isLoading: false,
  error: null,
  isInitialized: false,
};

// Async thunks
export const fetchLanguagePairs = createAsyncThunk(
  'languagePairs/fetchLanguagePairs',
  async (userId: string) => {
    const response = await fetch(`/api/language-pairs?user_id=${userId}`);
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return Array.isArray(data) ? data : [data];
  }
);

export const addLanguagePair = createAsyncThunk(
  'languagePairs/addLanguagePair',
  async (pairData: { user_id: string; from_lang: string; to_lang: string }) => {
    const response = await fetch('/api/language-pairs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pairData),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return Array.isArray(data) ? data : [data];
  }
);

export const deleteLanguagePair = createAsyncThunk(
  'languagePairs/deleteLanguagePair',
  async (id: string) => {
    const response = await fetch('/api/language-pairs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return id;
  }
);

const languagePairsSlice = createSlice({
  name: 'languagePairs',
  initialState,
  reducers: {
    clearLanguagePairs: (state) => {
      state.pairs = [];
      state.error = null;
      state.isInitialized = false;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchLanguagePairs
    builder
      .addCase(fetchLanguagePairs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLanguagePairs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pairs = action.payload;
        state.isInitialized = true;
      })
      .addCase(fetchLanguagePairs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch language pairs';
      });

    // addLanguagePair
    builder
      .addCase(addLanguagePair.pending, (state) => {
        state.error = null;
      })
      .addCase(addLanguagePair.fulfilled, (state, action) => {
        // 重複を避けて新しいペアを追加
        const newPairs = action.payload;
        state.pairs = [...state.pairs, ...newPairs].filter(
          (pair, idx, arr) =>
            arr.findIndex(
              (p) =>
                p.from_lang === pair.from_lang &&
                p.to_lang === pair.to_lang &&
                p.user_id === pair.user_id
            ) === idx
        );
      })
      .addCase(addLanguagePair.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add language pair';
      });

    // deleteLanguagePair
    builder
      .addCase(deleteLanguagePair.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteLanguagePair.fulfilled, (state, action) => {
        state.pairs = state.pairs.filter((pair) => pair.id !== action.payload);
      })
      .addCase(deleteLanguagePair.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete language pair';
      });
  },
});

export const { clearLanguagePairs, setError } = languagePairsSlice.actions;
export default languagePairsSlice.reducer;