SHELL=/bin/bash

all: setup compile export-verifier

setup:
	zokrates setup

compile:
	zokrates compile -i bid.zok

export-verifier:
	rm -rf  verifier.sol
	zokrates export-verifier -o verifier.sol

proof:
	zokrates generate-proof
