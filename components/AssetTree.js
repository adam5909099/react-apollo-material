import React, { useCallback, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import AssetItem from "./AssetItem";
import AssetDialog from "./AssetDialog";

const useStyles = makeStyles({
  treeView: {
    maxWidth: 400,
  },
});

export default function AssetTree() {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [siblingAssets, setSiblingAssets] = useState([]);
  const [parentKey, setParentKey] = useState("");

  const addAsset = useCallback((siblingAssets, parentKey) => {
    setOpen(true);
    setSiblingAssets(siblingAssets);
    setParentKey(parentKey);
  }, []);

  const editAsset = useCallback((asset) => {
    setOpen(true);
    setEditingAsset(asset);
    console.log(asset);
    setParentKey(asset.key.slice(0, -2));
  }, []);

  const handleClose = () => {
    setOpen(false);
    setEditingAsset(null);
  };

  return (
    <>
      <AssetDialog
        open={open}
        onClose={handleClose}
        editingAsset={editingAsset}
        siblingAssets={siblingAssets}
        parentKey={parentKey}
      />
      <TreeView
        className={classes.treeView}
        defaultExpanded={[""]}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        <AssetItem
          asset={{ key: "", name: "Assets" }}
          addAsset={addAsset}
          editAsset={editAsset}
        />
      </TreeView>
    </>
  );
}
