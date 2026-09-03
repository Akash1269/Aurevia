// TypeScript's bundled DOM lib has the core File System Access handle
// interfaces (FileSystemDirectoryHandle, FileSystemFileHandle) but is
// missing the picker entry point and the permission methods - fill in just
// those gaps rather than pulling in a whole extra lib package.
export {}

declare global {
  interface FileSystemPermissionDescriptor {
    mode?: 'read' | 'readwrite'
  }

  interface FileSystemHandle {
    queryPermission(descriptor?: FileSystemPermissionDescriptor): Promise<PermissionState>
    requestPermission(descriptor?: FileSystemPermissionDescriptor): Promise<PermissionState>
  }

  interface DirectoryPickerOptions {
    id?: string
    mode?: 'read' | 'readwrite'
  }

  interface Window {
    showDirectoryPicker(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>
  }
}
