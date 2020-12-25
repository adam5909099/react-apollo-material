import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import { useForm, Controller } from "react-hook-form";
import TextField from "@material-ui/core/TextField";
import { gql, useMutation } from "@apollo/client";

const ADD_ASSET = gql`
  mutation AddAsset($asset: AddAssetInput!) {
    addAsset(input: [$asset]) {
      asset {
        id
        name
        description
      }
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  content: {
    "& > *": {
      width: "100%",
      "&:not(:first-child)": {
        marginTop: theme.spacing(2),
      },
    },
  },
}));

export default function AssetItemDialog({ open, onClose, assetItem }) {
  const classes = useStyles();
  const { handleSubmit, control } = useForm();
  const [addAsset, { loading }] = useMutation(ADD_ASSET, {
    onCompleted: onClose,
  });

  const onSubmit = (formData) => {
    addAsset({ variables: formData });
  };

  return (
    <Dialog onClose={onClose} aria-labelledby="asset-item-dialog" open={open}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle disableTypography className={classes.root}>
          <Typography variant="h6">{assetItem?.name ?? "New asset"}</Typography>
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers className={classes.content}>
          <Controller
            as={TextField}
            label="Name"
            variant="outlined"
            name="name"
            control={control}
            defaultValue={assetItem?.name ?? ""}
          />
          <Controller
            as={TextField}
            label="Description"
            variant="outlined"
            name="description"
            multiline
            rows={4}
            control={control}
            defaultValue={assetItem?.description ?? ""}
          />
        </DialogContent>
        <DialogActions>
          <Button type="submit" disabled={loading} autoFocus color="primary">
            {assetItem ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
