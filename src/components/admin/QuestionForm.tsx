import { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabase } from '../../lib/supabase';
import type { Question } from '../../types';

interface QuestionFormProps {
  onSubmit: (question: Omit<Question, 'id' | 'quiz_id' | 'created_at'>) => void;
  nextOrderIndex: number;
}

export function QuestionForm({ onSubmit, nextOrderIndex }: QuestionFormProps) {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'multiple_choice' | 'text'>('multiple_choice');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  }

  function removeImage() {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('question-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('question-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  function handleOptionChange(index: number, value: string) {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!questionText.trim()) {
      setError('Please enter a question');
      return;
    }

    if (questionType === 'multiple_choice') {
      const filledOptions = options.filter((o) => o.trim());
      if (filledOptions.length < 2) {
        setError('Please enter at least 2 options');
        return;
      }
      if (correctAnswers.length === 0) {
        setError('Please select at least one correct answer');
        return;
      }
      const invalidAnswers = correctAnswers.filter((a) => !filledOptions.includes(a));
      if (invalidAnswers.length > 0) {
        setError('All correct answers must match one of the options');
        return;
      }
    } else {
      if (correctAnswers.length === 0 || !correctAnswers[0]?.trim()) {
        setError('Please enter at least one correct answer');
        return;
      }
    }

    let imageUrl: string | null = null;
    if (imageFile) {
      setIsUploading(true);
      imageUrl = await uploadImage(imageFile);
      setIsUploading(false);
      if (!imageUrl) {
        setError('Failed to upload image');
        return;
      }
    }

    onSubmit({
      question_text: questionText.trim(),
      question_type: questionType,
      options: questionType === 'multiple_choice' ? options.filter((o) => o.trim()) : null,
      correct_answers: questionType === 'multiple_choice'
        ? correctAnswers
        : correctAnswers.map(a => a.trim()).filter(a => a),
      order_index: nextOrderIndex,
      image_url: imageUrl,
      category: category.trim() || null,
    });

    // Reset form
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswers([]);
    setCategory('');
    removeImage();
    setError('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-pixel text-[10px] text-retro-cyan mb-3 uppercase">
          Question Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="questionType"
              value="multiple_choice"
              checked={questionType === 'multiple_choice'}
              onChange={() => setQuestionType('multiple_choice')}
              className="sr-only"
            />
            <span className={`font-pixel text-[8px] px-3 py-2 border-2 transition-all ${
              questionType === 'multiple_choice'
                ? 'border-retro-cyan bg-retro-cyan/20 text-retro-cyan'
                : 'border-retro-gray text-retro-gray hover:border-retro-magenta'
            }`}>
              MULTIPLE CHOICE
            </span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="questionType"
              value="text"
              checked={questionType === 'text'}
              onChange={() => setQuestionType('text')}
              className="sr-only"
            />
            <span className={`font-pixel text-[8px] px-3 py-2 border-2 transition-all ${
              questionType === 'text'
                ? 'border-retro-cyan bg-retro-cyan/20 text-retro-cyan'
                : 'border-retro-gray text-retro-gray hover:border-retro-magenta'
            }`}>
              TEXT ANSWER
            </span>
          </label>
        </div>
      </div>

      <Input
        label="Category (Optional)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="E.G. LAND, BYER, KJENTE PERSONER"
      />

      <Input
        label="Question"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="ENTER YOUR QUESTION"
      />

      <div>
        <label className="block font-pixel text-[10px] text-retro-cyan mb-3 uppercase">
          Image (Optional)
        </label>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer px-4 py-2 bg-retro-black border-2 border-retro-gray font-pixel text-[8px] text-retro-gray hover:border-retro-magenta hover:text-retro-magenta transition-all">
            CHOOSE FILE
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
          {imageFile && (
            <span className="font-retro text-sm text-retro-green truncate max-w-[200px]">
              {imageFile.name}
            </span>
          )}
        </div>
        {imagePreview && (
          <div className="mt-3 border-2 border-retro-gray p-2 relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-32 object-contain"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-retro-red text-retro-black font-pixel text-xs flex items-center justify-center hover:bg-retro-yellow transition-colors"
            >
              X
            </button>
          </div>
        )}
      </div>

      {questionType === 'multiple_choice' && (
        <div className="space-y-2">
          <label className="block font-pixel text-[10px] text-retro-cyan uppercase">
            Options (Check the correct answers)
          </label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={correctAnswers.includes(option) && option.trim() !== ''}
                  onChange={(e) => {
                    if (option.trim() === '') return;
                    if (e.target.checked) {
                      setCorrectAnswers([...correctAnswers, option]);
                    } else {
                      setCorrectAnswers(correctAnswers.filter(a => a !== option));
                    }
                  }}
                  disabled={option.trim() === ''}
                  className="sr-only"
                />
                <span className={`w-8 h-8 border-2 flex items-center justify-center font-pixel text-[10px] transition-all ${
                  correctAnswers.includes(option) && option.trim() !== ''
                    ? 'bg-retro-green border-retro-green text-retro-black'
                    : 'bg-retro-purple border-retro-magenta text-retro-magenta'
                }`}>
                  {correctAnswers.includes(option) && option.trim() !== '' ? '✓' : String.fromCharCode(65 + index)}
                </span>
              </label>
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const oldValue = option;
                  const newValue = e.target.value;
                  handleOptionChange(index, newValue);
                  // Update correctAnswers if this option was selected
                  if (correctAnswers.includes(oldValue)) {
                    setCorrectAnswers(correctAnswers.map(a => a === oldValue ? newValue : a));
                  }
                }}
                placeholder={`OPTION ${String.fromCharCode(65 + index)}`}
                className="flex-1 px-3 py-2 bg-retro-black border-2 border-retro-gray font-retro text-lg text-retro-green placeholder-retro-gray focus:border-retro-cyan focus:shadow-neon-cyan focus:outline-none transition-all"
              />
            </div>
          ))}
        </div>
      )}

      {questionType === 'text' && (
        <div className="space-y-2">
          <label className="block font-pixel text-[10px] text-retro-cyan uppercase">
            Correct Answers (one per line)
          </label>
          <textarea
            value={correctAnswers.join('\n')}
            onChange={(e) => setCorrectAnswers(e.target.value.split('\n'))}
            placeholder="ENTER CORRECT ANSWERS (ONE PER LINE)"
            className="w-full px-3 py-2 bg-retro-black border-2 border-retro-gray font-retro text-lg text-retro-green placeholder-retro-gray focus:border-retro-cyan focus:shadow-neon-cyan focus:outline-none transition-all min-h-[80px] resize-none"
          />
          <p className="font-pixel text-[8px] text-retro-gray">
            ADD MULTIPLE ACCEPTED ANSWERS, ONE PER LINE
          </p>
        </div>
      )}

      {error && <p className="font-pixel text-[8px] text-retro-red uppercase">{error}</p>}

      <Button type="submit" variant="secondary" disabled={isUploading}>
        {isUploading ? 'UPLOADING...' : 'ADD ROUND'}
      </Button>
    </form>
  );
}
