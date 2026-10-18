#!/bin/bash

# Apply macOS Tahoe patches to OpenZFS
# Files:
# - spl-taskq.c (Issue #43)
# - zfs_vnops_osx.c (Issue #53)

SPL_DIR="$HOME/Developer/zfs-build/spl"
ZFS_DIR="$HOME/Developer/zfs-build/zfs"

echo "=== Applying macOS Tahoe Patches ==="
echo ""

# Check SPL patch location
SPL_TASKQ="$SPL_DIR/module/spl/spl-taskq.c"
if [[ -f "$SPL_TASKQ" ]]; then
    echo "Found SPL taskq at: $SPL_TASKQ"
    
    # Check if already patched
    if grep -q "Tahoe fix" "$SPL_TASKQ"; then
        echo "SPL patch already applied"
    else
        echo "Applying SPL patch (Issue #43 - task queue crash)..."
        
        # Create backup
        cp "$SPL_TASKQ" "${SPL_TASKQ}.backup"
        
        # Find the line number for taskq_thread
        LINE=$(grep -n "^static void" "$SPL_TASKQ" | grep "taskq_thread" | head -1 | cut -d: -f1)
        echo "Found taskq_thread at line: $LINE"
        
        # Create patch using sed to insert null checks
        awk '
        /^static void$/ {
            getline next_line
            if (next_line ~ /taskq_thread/) {
                print "void"
                print "// Tahoe fix: add null checks for Issue #43"
                print "if (tq == NULL) {"
                print "    spl_panic(\"taskq_thread: NULL taskq\\n\");"
                print "    return;"
                print "}"
                print ""
                print "if (tq->tq_thread == NULL) {"
                print "    spl_panic(\"taskq_thread: NULL tq->tq_thread\\n\");"
                print "    return;"
                print "}"
                print ""
                next
            }
        }
        { print }
        ' "${SPL_TASKQ}.backup" > "$SPL_TASKQ"
        
        echo "SPL patch applied"
    fi
else
    echo "SPL taskq file not found at $SPL_TASKQ"
fi

echo ""

# Check ZFS patch location
ZFS_VNOPS="$ZFS_DIR/module/os/macos/zfs/zfs_vnops_osx.c"
if [[ -f "$ZFS_VNOPS" ]]; then
    echo "Found ZFS vnops at: $ZFS_VNOPS"
    
    # Check if already patched
    if grep -q "Tahoe fix" "$ZFS_VNOPS"; then
        echo "ZFS patch already applied"
    else
        echo "Applying ZFS patch (Issue #53 - pageout crash)..."
        
        # Create backup
        cp "$ZFS_VNOPS" "${ZFS_VNOPS}.backup"
        
        # Create patch for zfs_vnop_pageoutv2
        awk '
        /^[[:space:]]*struct vnode \*vp = ap->a_vp;/ {
            print $0
            print ""
            print "\t// Tahoe fix: add safety checks for Issue #53"
            print "\tif (vp == NULL) {"
            print "\t\treturn EINVAL;"
            print "\t}"
            print ""
            print "\tif (!VOPISZFS(vp)) {"
            print "\t\treturn EINVAL;"
            print "\t}"
            next
        }
        { print }
        ' "${ZFS_VNOPS}.backup" > "$ZFS_VNOPS"
        
        echo "ZFS patch applied"
    fi
else
    echo "ZFS vnops file not found at $ZFS_VNOPS"
fi

echo ""
echo "=== Patches complete ==="
