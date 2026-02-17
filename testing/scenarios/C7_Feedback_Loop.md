# Cluster C7: Intelligence Feedback Loop

Verify that users can "Train the AI" by passing manual overrides back into the `ai_learning_examples` table.

## C7-001: Feed Training Scenario (Human Feedback)
- **Goal:** Verify that the "Train AI on this Match" button correctly populates the learning table.
- **Test Data:** A blocked invoice that has been manually analyzed.
- **DB Requirements:** Initial state with empty/baseline `ai_learning_examples`.
- **Success Criteria:** 
    - New row created in `ai_learning_examples`.
    - `vendor_name` reflects the current invoice.
    - `resolution_note` contains the logic provided by the controller.
    - **Follow-up:** Verify C4-001 (Historical Approval) can now succeed based on this entry.
