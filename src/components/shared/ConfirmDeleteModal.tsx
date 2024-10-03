import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button.tsx";

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Overlay className="fixed inset-0 bg-black/70" />{" "}
      {/* Darker background */}
      <Dialog.Content className="fixed top-1/2 left-1/2 w-80 p-4 translate-x-[-50%] translate-y-[-50%] bg-black text-white rounded-md shadow-lg">
        <Dialog.Title className="text-lg font-bold">
          Confirm Deletion
        </Dialog.Title>
        <Dialog.Description className="mt-2">
          Are you sure you want to delete this post?
        </Dialog.Description>
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="mr-2 text-white border-white hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default ConfirmDeleteModal;
