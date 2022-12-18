SHELL=/bin/bash

.PHONY: init compile-zok compile-sol clean

init: clean make-zok compile-sol

make-zok:
	cd zokrates && make

compile-zok:
	cd zokrates && make compile

compile-sol:
	cp zokrates/verifier.sol contracts/verifier.sol
	npx hardhat compile

clean:
	rm -rf contracts/verifier.sol
