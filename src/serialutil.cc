#include <errno.h>
#include <string.h>
#include <sys/ioctl.h>
#include <termios.h>

#include <v8.h>
#include <node.h>
#include <nan.h>

#include "serialutil.h"

// TODO - There are lots of NanThrowError that should have return!!!

static const char PARITY_NONE[] = "none";
static const char PARITY_ODD[] = "odd";
static const char PARITY_EVEN[] = "even";

NAN_METHOD(GetBaudRate) {
  NanScope();

  if (args.Length() < 1 || !args[0]->IsInt32()) {
    return NanThrowError(
      "incorrect arguments passed to getBaudRate(int fd)"
    );
  }

  int fd = args[0]->Int32Value();

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    NanThrowError(strerror(errno), errno);
  }

  speed_t baudRate = cfgetospeed(&tio);

  NanReturnValue(NanNew<v8::Number>(baudRate));
}

NAN_METHOD(SetBaudRate) {
  NanScope();

  if (args.Length() < 2 || !args[0]->IsInt32() || !args[1]->IsInt32()) {
    return NanThrowError(
      "incorrect arguments passed to setBaudRate(int fd, int baudRate)"
    );
  }

  int fd = args[0]->Int32Value();
  size_t baudRate = args[1]->Int32Value();

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    NanThrowError(strerror(errno), errno);
  }

  if (cfsetospeed(&tio, baudRate)) {
    NanThrowError(strerror(errno), errno);
  }

  if (cfsetispeed(&tio, baudRate)) {
    NanThrowError(strerror(errno), errno);
  }

  if (tcsetattr(fd, TCSANOW, &tio)) {
    NanThrowError(strerror(errno), errno);
  }

  NanReturnUndefined();
}

NAN_METHOD(GetCharacterSize) {
  NanScope();

  if (args.Length() < 1 || !args[0]->IsInt32()) {
    return NanThrowError(
      "incorrect arguments passed to getCharacterSize(int fd)"
    );
  }

  int fd = args[0]->Int32Value();

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    NanThrowError(strerror(errno), errno);
  }

  int size = 0;

  switch (tio.c_cflag & CSIZE) {
    case CS5:
      size = 5;
      break;
    case CS6:
      size = 6;
      break;
    case CS7:
      size = 7;
      break;
    case CS8:
      size = 8;
      break;
  }

  NanReturnValue(NanNew<v8::Number>(size));
}

NAN_METHOD(SetCharacterSize) {
  NanScope();

  if (args.Length() < 2 || !args[0]->IsInt32() || !args[1]->IsInt32()) {
    return NanThrowError(
      "incorrect arguments passed to setCharacterSize(int fd, int size)"
    );
  }

  int fd = args[0]->Int32Value();
  size_t size = args[1]->Int32Value();

  if (size < 5 || size > 8) {
    return NanThrowError(
      "setCharacterSize(int fd, int size) expects size to be 5, 6, 7, or 8"
    );
  }

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    NanThrowError(strerror(errno), errno);
  }

  tio.c_cflag &= ~CSIZE;

  switch (size) {
    case 5:
      tio.c_cflag |= CS5;
      break;
    case 6:
      tio.c_cflag |= CS6;
      break;
    case 7:
      tio.c_cflag |= CS7;
      break;
    case 8:
      tio.c_cflag |= CS8;
      break;
  }

  if (tcsetattr(fd, TCSANOW, &tio)) {
    NanThrowError(strerror(errno), errno);
  }

  NanReturnUndefined();
}

NAN_METHOD(GetParity) {
  NanScope();

  if (args.Length() < 1 || !args[0]->IsInt32()) {
    return NanThrowError(
      "incorrect arguments passed to getParity(int fd)"
    );
  }

  int fd = args[0]->Int32Value();

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    NanThrowError(strerror(errno), errno);
  }

  if (tio.c_cflag & PARENB) {
    if (tio.c_cflag & PARODD) {
      NanReturnValue(NanNew<v8::String>(PARITY_ODD));
    }
    NanReturnValue(NanNew<v8::String>(PARITY_EVEN));
  }

  NanReturnValue(NanNew<v8::String>(PARITY_NONE));
}

NAN_METHOD(SetParity) {
  NanScope();

  if (args.Length() < 2 || !args[0]->IsInt32() || !args[1]->IsString()) {
    return NanThrowError(
      "incorrect arguments passed to setParity(int fd, char[] type)"
    );
  }

  int fd = args[0]->Int32Value();
  NanUtf8String type(args[1]);

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    NanThrowError(strerror(errno), errno);
  }

  if (strcmp(*type, PARITY_NONE) == 0) {
    tio.c_cflag &= ~PARENB;
  } else if (strcmp(*type, PARITY_ODD) == 0) {
    tio.c_cflag |= PARENB;
    tio.c_cflag |= PARODD;
  } else if (strcmp(*type, PARITY_EVEN) == 0) {
    tio.c_cflag |= PARENB;
    tio.c_cflag &= ~PARODD;
  } else {
    return NanThrowError(
      "setParity(int fd, char[] type) expects type to be \"none\", \"odd\", or \"even\""
    );
  }

  if (tcsetattr(fd, TCSANOW, &tio)) {
    NanThrowError(strerror(errno), errno);
  }

  NanReturnUndefined();
}

NAN_METHOD(GetStopBits) {
  NanScope();

  if (args.Length() < 1 || !args[0]->IsInt32()) {
    return NanThrowError(
      "incorrect arguments passed to setStopBits(int fd)"
    );
  }

  int fd = args[0]->Int32Value();

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    NanThrowError(strerror(errno), errno);
  }

  int count = 1;

  if (tio.c_cflag & CSTOPB) {
    count = 2;
  }

  NanReturnValue(NanNew<v8::Number>(count));
}

NAN_METHOD(SetStopBits) {
  NanScope();

  if (args.Length() < 2 || !args[0]->IsInt32() || !args[1]->IsInt32()) {
    return NanThrowError(
      "incorrect arguments passed to setStopBits(int fd, int count)"
    );
  }

  int fd = args[0]->Int32Value();
  size_t count = args[1]->Int32Value();

  if (count < 1 || count > 2) {
    return NanThrowError(
      "setStopBits(int fd, int count) expects count to be 1 or 2"
    );
  }

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    NanThrowError(strerror(errno), errno);
  }

  switch (count) {
    case 1:
      tio.c_cflag &= ~CSTOPB;
      break;
    case 2:
      tio.c_cflag |= CSTOPB;
      break;
  }

  if (tcsetattr(fd, TCSANOW, &tio)) {
    NanThrowError(strerror(errno), errno);
  }

  NanReturnUndefined();
}

NAN_METHOD(SetRawMode) {
  NanScope();

  if (args.Length() < 1 || !args[0]->IsInt32()) {
    return NanThrowError(
      "incorrect arguments passed to setRawMode(int fd)"
    );
  }

  int fd = args[0]->Int32Value();

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    NanThrowError(strerror(errno), errno);
  }

  cfmakeraw(&tio);

  if (tcsetattr(fd, TCSADRAIN, &tio)) {
    NanThrowError(strerror(errno), errno);
  }

  NanReturnUndefined();
}

NAN_METHOD(SetCanonical) {
  NanScope();

  if (args.Length() < 2 || !args[0]->IsInt32() || !args[1]->IsBoolean()) {
    return NanThrowError(
      "incorrect arguments passed to setCanonical(int fd, bool canonical)"
    );
  }

  int fd = args[0]->Int32Value();
  bool canonical = args[1]->IsTrue();

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    NanThrowError(strerror(errno), errno);
  }

  if (canonical) {
    tio.c_lflag |= ICANON;
  } else {
    tio.c_lflag &= ~(ICANON);
  }

  if (tcsetattr(fd, TCSANOW, &tio)) {
    NanThrowError(strerror(errno), errno);
  }

  NanReturnUndefined();
}

NAN_METHOD(FakeInput) {
  NanScope();

  if (args.Length() < 2 || !args[0]->IsInt32() || !args[1]->IsInt32()) {
    return NanThrowError(
      "incorrect arguments passed to fakeInput(int fd, int ch)"
    );
  }

  int fd = args[0]->Int32Value();
  char ch = args[1]->Int32Value();

  if (ioctl(fd, TIOCSTI, &ch)) {
    NanThrowError(strerror(errno), errno);
  }

  NanReturnUndefined();
}

void Init(v8::Handle<v8::Object> exports) {
  exports->Set(NanNew<v8::String>("B0"), NanNew<v8::Number>(B0));
  exports->Set(NanNew<v8::String>("B50"), NanNew<v8::Number>(B50));
  exports->Set(NanNew<v8::String>("B75"), NanNew<v8::Number>(B75));
  exports->Set(NanNew<v8::String>("B110"), NanNew<v8::Number>(B110));
  exports->Set(NanNew<v8::String>("B134"), NanNew<v8::Number>(B134));
  exports->Set(NanNew<v8::String>("B150"), NanNew<v8::Number>(B150));
  exports->Set(NanNew<v8::String>("B200"), NanNew<v8::Number>(B200));
  exports->Set(NanNew<v8::String>("B300"), NanNew<v8::Number>(B300));
  exports->Set(NanNew<v8::String>("B600"), NanNew<v8::Number>(B600));
  exports->Set(NanNew<v8::String>("B1200"), NanNew<v8::Number>(B1200));
  exports->Set(NanNew<v8::String>("B1800"), NanNew<v8::Number>(B1800));
  exports->Set(NanNew<v8::String>("B2400"), NanNew<v8::Number>(B2400));
  exports->Set(NanNew<v8::String>("B4800"), NanNew<v8::Number>(B4800));
  exports->Set(NanNew<v8::String>("B9600"), NanNew<v8::Number>(B9600));
  exports->Set(NanNew<v8::String>("B19200"), NanNew<v8::Number>(B19200));
  exports->Set(NanNew<v8::String>("B38400"), NanNew<v8::Number>(B38400));
  exports->Set(NanNew<v8::String>("B57600"), NanNew<v8::Number>(B57600));
  exports->Set(NanNew<v8::String>("B115200"), NanNew<v8::Number>(B115200));
  exports->Set(NanNew<v8::String>("B230400"), NanNew<v8::Number>(B230400));
  exports->Set(NanNew<v8::String>("B460800"), NanNew<v8::Number>(B460800));
  exports->Set(NanNew<v8::String>("B500000"), NanNew<v8::Number>(B500000));
  exports->Set(NanNew<v8::String>("B576000"), NanNew<v8::Number>(B576000));
  exports->Set(NanNew<v8::String>("B921600"), NanNew<v8::Number>(B921600));
  exports->Set(NanNew<v8::String>("B1000000"), NanNew<v8::Number>(B1000000));
  exports->Set(NanNew<v8::String>("B1152000"), NanNew<v8::Number>(B1152000));
  exports->Set(NanNew<v8::String>("B1500000"), NanNew<v8::Number>(B1500000));
  exports->Set(NanNew<v8::String>("B2000000"), NanNew<v8::Number>(B2000000));
  exports->Set(NanNew<v8::String>("B2500000"), NanNew<v8::Number>(B2500000));
  exports->Set(NanNew<v8::String>("B3000000"), NanNew<v8::Number>(B3000000));
  exports->Set(NanNew<v8::String>("B3500000"), NanNew<v8::Number>(B3500000));
  exports->Set(NanNew<v8::String>("B4000000"), NanNew<v8::Number>(B4000000));

  exports->Set(NanNew<v8::String>("PARITY_NONE"), NanNew<v8::String>(PARITY_NONE));
  exports->Set(NanNew<v8::String>("PARITY_ODD"), NanNew<v8::String>(PARITY_ODD));
  exports->Set(NanNew<v8::String>("PARITY_EVEN"), NanNew<v8::String>(PARITY_EVEN));

  exports->Set(
    NanNew<v8::String>("getBaudRate"),
    NanNew<v8::FunctionTemplate>(GetBaudRate)->GetFunction()
  );
  exports->Set(
    NanNew<v8::String>("setBaudRate"),
    NanNew<v8::FunctionTemplate>(SetBaudRate)->GetFunction()
  );
  exports->Set(
    NanNew<v8::String>("getCharacterSize"),
    NanNew<v8::FunctionTemplate>(GetCharacterSize)->GetFunction()
  );
  exports->Set(
    NanNew<v8::String>("setCharacterSize"),
    NanNew<v8::FunctionTemplate>(SetCharacterSize)->GetFunction()
  );
  exports->Set(
    NanNew<v8::String>("getParity"),
    NanNew<v8::FunctionTemplate>(GetParity)->GetFunction()
  );
  exports->Set(
    NanNew<v8::String>("setParity"),
    NanNew<v8::FunctionTemplate>(SetParity)->GetFunction()
  );
  exports->Set(
    NanNew<v8::String>("getStopBits"),
    NanNew<v8::FunctionTemplate>(GetStopBits)->GetFunction()
  );
  exports->Set(
    NanNew<v8::String>("setStopBits"),
    NanNew<v8::FunctionTemplate>(SetStopBits)->GetFunction()
  );
  exports->Set(
    NanNew<v8::String>("setRawMode"),
    NanNew<v8::FunctionTemplate>(SetRawMode)->GetFunction()
  );
  exports->Set(
    NanNew<v8::String>("setCanonical"),
    NanNew<v8::FunctionTemplate>(SetCanonical)->GetFunction()
  );
  exports->Set(
    NanNew<v8::String>("fakeInput"),
    NanNew<v8::FunctionTemplate>(FakeInput)->GetFunction()
  );
}

NODE_MODULE(serialutil, Init)

