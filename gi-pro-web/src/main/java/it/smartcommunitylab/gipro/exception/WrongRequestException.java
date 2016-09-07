package it.smartcommunitylab.gipro.exception;

public class WrongRequestException extends Exception {
	private static final long serialVersionUID = 1932134789170282070L;

	public WrongRequestException() {
		super();
	}

	public WrongRequestException(String message) {
		super(message);
	}
}
