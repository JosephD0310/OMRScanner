import argparse
import sys
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import shutil
import uvicorn

from src.entry import entry_point
from src.logger import logger

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://omr-scanner-puce.vercel.app/"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INPUT_DIR = Path("inputs")
INPUT_DIR.mkdir(exist_ok=True)

def parse_args():
    # construct the argument parse and parse the arguments
    argparser = argparse.ArgumentParser()

    argparser.add_argument(
        "-i",
        "--inputDir",
        default=["inputs"],
        # https://docs.python.org/3/library/argparse.html#nargs
        nargs="*",
        required=False,
        type=str,
        dest="input_paths",
        help="Specify an input directory.",
    )

    argparser.add_argument(
        "-d",
        "--debug",
        required=False,
        dest="debug",
        action="store_false",
        help="Enables debugging mode for showing detailed errors",
    )

    argparser.add_argument(
        "-o",
        "--outputDir",
        default="outputs",
        required=False,
        dest="output_dir",
        help="Specify an output directory.",
    )

    argparser.add_argument(
        "-a",
        "--autoAlign",
        required=False,
        dest="autoAlign",
        action="store_true",
        help="(experimental) Enables automatic template alignment - \
        use if the scans show slight misalignments.",
    )

    argparser.add_argument(
        "-l",
        "--setLayout",
        required=False,
        dest="setLayout",
        action="store_true",
        help="Set up OMR template layout - modify your json file and \
        run again until the template is set.",
    )

    (
        args,
        unknown,
    ) = argparser.parse_known_args()

    args = vars(args)

    if len(unknown) > 0:
        logger.warning(f"\nError: Unknown arguments: {unknown}", unknown)
        argparser.print_help()
        exit(11)
    return args


def entry_point_for_args(args):
    if args["debug"] is True:
        # Disable tracebacks
        sys.tracebacklimit = 0
    for root in args["input_paths"]:
        entry_point(
            Path(root),
            args,
        )

def process_image():
    args = parse_args()
    entry_point_for_args(args) 

@app.post("/process-image/")
async def upload_file(file: UploadFile = File(...), background_tasks: BackgroundTasks = BackgroundTasks()):
    file_path = INPUT_DIR / file.filename
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    background_tasks.add_task(process_image)  # Xử lý ảnh sau khi tải lên
    return {"message": "File uploaded successfully", "filename": file.filename}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
