import { useState } from 'react';
import type { ReviewStatus } from '../types';

interface Props {
  status: ReviewStatus;
  onStatusChange: (status: ReviewStatus) => void;
}

const REVIEWER = { name: 'Dr. Angela Torres', role: 'MD, Primary Care' };

export default function ReviewStatusBadge({ status, onStatusChange }: Props) {
  const [confirming, setConfirming] = useState(false);

  const handleToggle = () => {
    if (status.state === 'reviewed') {
      onStatusChange({ state: 'unreviewed' });
      setConfirming(false);
    } else {
      setConfirming(true);
    }
  };

  const handleConfirm = () => {
    onStatusChange({
      state: 'reviewed',
      reviewerName: REVIEWER.name,
      reviewerRole: REVIEWER.role,
      reviewedAt: new Date().toISOString(),
    });
    setConfirming(false);
  };

  const isReviewed = status.state === 'reviewed';

  return (
    <div className="review-badge-container" role="region" aria-label="Human review status">
      <div className={`review-badge ${isReviewed ? 'review-badge--reviewed' : 'review-badge--unreviewed'}`}>
        <span className="review-badge__icon" aria-hidden="true">
          {isReviewed ? '✔' : '⏳'}
        </span>
        <span className="review-badge__label">
          {isReviewed
            ? `Reviewed by: ${(status as Extract<ReviewStatus, { state: 'reviewed' }>).reviewerName}`
            : 'Unreviewed — Pending Clinician Verification'}
        </span>
        {isReviewed && (
          <span className="review-badge__meta">
            {(status as Extract<ReviewStatus, { state: 'reviewed' }>).reviewerRole} ·{' '}
            {new Date(
              (status as Extract<ReviewStatus, { state: 'reviewed' }>).reviewedAt
            ).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        )}
      </div>

      {!confirming ? (
        <button
          className="review-btn"
          onClick={handleToggle}
        >
          {isReviewed ? 'Revoke Review' : 'Mark as Reviewed'}
        </button>
      ) : (
        <div className="review-confirm" role="group" aria-label="Confirm review action">
          <span className="review-confirm__prompt">
            Mark as reviewed by <strong>{REVIEWER.name}</strong>?
          </span>
          <button className="review-btn review-btn--confirm" onClick={handleConfirm} autoFocus>
            Confirm
          </button>
          <button
            className="review-btn review-btn--cancel"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
