'use client';

import { useState } from 'react';

const AddTaskDialog = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Both title and description are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
      });

      if (!result.success) {
        setError(result.error || 'Failed to create task');
      }
    } catch (err) {
      console.log(err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-pink-200">
          <h2 className="text-xl font-semibold text-pink-700">
            Add New Task
          </h2>

          <button
            onClick={onClose}
            className="text-pink-400 hover:text-pink-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">

          {error && (
            <div className="mb-4 p-3 bg-pink-50 border border-pink-200 rounded-md">
              <p className="text-pink-700 text-sm">{error}</p>
            </div>
          )}

          {/* Task Title */}
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-pink-700 mb-2"
            >
              Task Title *
            </label>

            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title..."
              maxLength={100}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-pink-300 rounded-md shadow-sm text-pink-700 placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200"
            />

            <p className="text-xs text-pink-500 mt-1">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-pink-700 mb-2"
            >
              Description *
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description..."
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-pink-300 rounded-md shadow-sm text-pink-700 placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 resize-none"
            />

            <p className="text-xs text-pink-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-pink-700 bg-pink-100 hover:bg-pink-200 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.title.trim() ||
                !formData.description.trim()
              }
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="w-4 h-4 mr-2 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskDialog;