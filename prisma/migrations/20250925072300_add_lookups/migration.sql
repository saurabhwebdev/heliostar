BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[LookupItem] (
    [id] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [LookupItem_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [value] NVARCHAR(1000) NOT NULL,
    [label] NVARCHAR(1000) NOT NULL,
    [order] INT,
    [active] BIT NOT NULL CONSTRAINT [LookupItem_active_df] DEFAULT 1,
    CONSTRAINT [LookupItem_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [LookupItem_type_value_key] UNIQUE NONCLUSTERED ([type],[value])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LookupItem_type_idx] ON [dbo].[LookupItem]([type]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
