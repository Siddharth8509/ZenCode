import Modal from "./modal";
import { Button } from "./ui/button";

export const SaveModal = ({ isOpen, onClose, onConfirm, loading }) => {
  return (
    <Modal
      title="Save your answer?"
      description="Once saved, you cannot edit or re-answer this question."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="pt-6 flex items-center justify-end gap-3 w-full">
        <Button disabled={loading} variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-900/30"
          onClick={onConfirm}
        >
          Save &amp; Continue
        </Button>
      </div>
    </Modal>
  );
};