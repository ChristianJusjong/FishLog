import React from 'react';
interface ReportContentModalProps {
    visible: boolean;
    onClose: () => void;
    contentType: 'catch' | 'comment' | 'user' | 'group_post' | 'group_message';
    contentId: string;
    contentTitle?: string;
}
export default function ReportContentModal({ visible, onClose, contentType, contentId, contentTitle, }: ReportContentModalProps): React.JSX.Element;
export {};
//# sourceMappingURL=ReportContentModal.d.ts.map