interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message = 'Something went wrong.', onRetry }: Props) {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-red-600 mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-indigo-600 hover:underline">
          Try again
        </button>
      )}
    </div>
  );
}
