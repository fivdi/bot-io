#include <errno.h>
#include <string.h>
#include <sys/ioctl.h>
#include <termios.h>

#include <v8.h>
#include <node.h>
#include <nan.h>

#include "serialutil.h"

static const char PARITY_NONE[] = "none";
static const char PARITY_ODD[] = "odd";
static const char PARITY_EVEN[] = "even";

NAN_METHOD(GetBaudRate) {
  if (info.Length() < 1 || !info[0]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "getBaudRate",
      "incorrect arguments passed to getBaudRate(int fd)")
    );
  }

  int fd = info[0]->Int32Value();

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
  }

  speed_t baudRate = cfgetospeed(&tio);

  info.GetReturnValue().Set(baudRate);
}

NAN_METHOD(SetBaudRate) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "setBaudRate",
      "incorrect arguments passed to setBaudRate(int fd, int baudRate)")
    );
  }

  int fd = info[0]->Int32Value();
  size_t baudRate = info[1]->Int32Value();

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
  }

  if (cfsetospeed(&tio, baudRate)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
  }

  if (cfsetispeed(&tio, baudRate)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
  }

  if (tcsetattr(fd, TCSANOW, &tio)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
  }
}

NAN_METHOD(GetCharacterSize) {
  if (info.Length() < 1 || !info[0]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "getCharacterSize",
      "incorrect arguments passed to getCharacterSize(int fd)")
    );
  }

  int fd = info[0]->Int32Value();

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
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

  info.GetReturnValue().Set(size);
}

NAN_METHOD(SetCharacterSize) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "setCharacterSize",
      "incorrect arguments passed to setCharacterSize(int fd, int size)")
    );
  }

  int fd = info[0]->Int32Value();
  size_t size = info[1]->Int32Value();

  if (size < 5 || size > 8) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "setCharacterSize",
      "setCharacterSize(int fd, int size) expects size to be 5, 6, 7, or 8")
    );
  }

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
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
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
  }
}

NAN_METHOD(GetParity) {
  if (info.Length() < 1 || !info[0]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "getParity",
      "incorrect arguments passed to getParity(int fd)")
    );
  }

  int fd = info[0]->Int32Value();

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
  }

  if (tio.c_cflag & PARENB) {
    if (tio.c_cflag & PARODD) {
      info.GetReturnValue().Set(Nan::New(PARITY_ODD).ToLocalChecked());
    } else {
      info.GetReturnValue().Set(Nan::New(PARITY_EVEN).ToLocalChecked());
    }
  } else {
    info.GetReturnValue().Set(Nan::New(PARITY_NONE).ToLocalChecked());
  }
}

NAN_METHOD(SetParity) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsString()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "setParity",
      "incorrect arguments passed to setParity(int fd, char[] type)")
    );
  }

  int fd = info[0]->Int32Value();
  Nan::Utf8String type(info[1]);

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
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
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "setParity",
      "setParity(int fd, char[] type) expects type to be \"none\", \"odd\", or \"even\"")
    );
  }

  if (tcsetattr(fd, TCSANOW, &tio)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
  }
}

NAN_METHOD(GetStopBits) {
  if (info.Length() < 1 || !info[0]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "getStopBits",
      "incorrect arguments passed to getStopBits(int fd)")
    );
  }

  int fd = info[0]->Int32Value();

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
  }

  int count = 1;

  if (tio.c_cflag & CSTOPB) {
    count = 2;
  }

  info.GetReturnValue().Set(count);
}

NAN_METHOD(SetStopBits) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "setStopBits",
      "incorrect arguments passed to setStopBits(int fd, int count)")
    );
  }

  int fd = info[0]->Int32Value();
  size_t count = info[1]->Int32Value();

  if (count < 1 || count > 2) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "setStopBits",
      "setStopBits(int fd, int count) expects count to be 1 or 2")
    );
  }

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
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
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
  }
}

NAN_METHOD(SetRawMode) {
  if (info.Length() < 1 || !info[0]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "setRawMode",
      "incorrect arguments passed to setRawMode(int fd)")
    );
  }

  int fd = info[0]->Int32Value();

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
  }

  cfmakeraw(&tio);

  if (tcsetattr(fd, TCSADRAIN, &tio)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
  }
}

NAN_METHOD(SetCanonical) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsBoolean()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "setCanonical",
      "incorrect arguments passed to setCanonical(int fd, bool canonical)")
    );
  }

  int fd = info[0]->Int32Value();
  bool canonical = info[1]->IsTrue();

  struct termios tio;
  if (tcgetattr(fd, &tio)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
  }

  if (canonical) {
    tio.c_lflag |= ICANON;
  } else {
    tio.c_lflag &= ~(ICANON);
  }

  if (tcsetattr(fd, TCSANOW, &tio)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
  }
}

NAN_METHOD(FakeInput) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "setCanonical",
      "incorrect arguments passed to fakeInput(int fd, int ch)")
    );
  }

  int fd = info[0]->Int32Value();
  char ch = info[1]->Int32Value();

  if (ioctl(fd, TIOCSTI, &ch)) {
    return Nan::ThrowError(Nan::ErrnoException(errno, strerror(errno), ""));
  }
}

static void SetConst(
  Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target,
  const char* name,
  int value
) {
  Nan::Set(target,
    Nan::New<v8::String>(name).ToLocalChecked(),
    Nan::New<v8::Integer>(value)
  );
}

static void SetConst(
  Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target,
  const char* name,
  const char* value
) {
  Nan::Set(target,
    Nan::New<v8::String>(name).ToLocalChecked(),
    Nan::New<v8::String>(value).ToLocalChecked()
  );
}

static void SetFunction(
  Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target,
  const char* name,
  Nan::FunctionCallback callback
) {
  Nan::Set(target,
    Nan::New(name).ToLocalChecked(),
    Nan::GetFunction(Nan::New<v8::FunctionTemplate>(callback)).ToLocalChecked()
  );
}

NAN_MODULE_INIT(Init) {
  SetConst(target, "B0", B0);
  SetConst(target, "B50", B50);
  SetConst(target, "B75", B75);
  SetConst(target, "B110", B110);
  SetConst(target, "B134", B134);
  SetConst(target, "B150", B150);
  SetConst(target, "B200", B200);
  SetConst(target, "B300", B300);
  SetConst(target, "B600", B600);
  SetConst(target, "B1200", B1200);
  SetConst(target, "B1800", B1800);
  SetConst(target, "B2400", B2400);
  SetConst(target, "B4800", B4800);
  SetConst(target, "B9600", B9600);
  SetConst(target, "B19200", B19200);
  SetConst(target, "B38400", B38400);
  SetConst(target, "B57600", B57600);
  SetConst(target, "B115200", B115200);
  SetConst(target, "B230400", B230400);
  SetConst(target, "B460800", B460800);
  SetConst(target, "B500000", B500000);
  SetConst(target, "B576000", B576000);
  SetConst(target, "B921600", B921600);
  SetConst(target, "B1000000", B1000000);
  SetConst(target, "B1152000", B1152000);
  SetConst(target, "B1500000", B1500000);
  SetConst(target, "B2000000", B2000000);
  SetConst(target, "B2500000", B2500000);
  SetConst(target, "B3000000", B3000000);
  SetConst(target, "B3500000", B3500000);
  SetConst(target, "B4000000", B4000000);

  SetConst(target, "PARITY_NONE", PARITY_NONE);
  SetConst(target, "PARITY_ODD", PARITY_ODD);
  SetConst(target, "PARITY_EVEN", PARITY_EVEN);

  SetFunction(target, "getBaudRate", GetBaudRate);
  SetFunction(target, "setBaudRate", SetBaudRate);
  SetFunction(target, "getCharacterSize", GetCharacterSize);
  SetFunction(target, "setCharacterSize", SetCharacterSize);
  SetFunction(target, "getParity", GetParity);
  SetFunction(target, "setParity", SetParity);
  SetFunction(target, "getStopBits", GetStopBits);
  SetFunction(target, "setStopBits", SetStopBits);
  SetFunction(target, "setRawMode", SetRawMode);
  SetFunction(target, "setCanonical", SetCanonical);
  SetFunction(target, "fakeInput", FakeInput);
}

NODE_MODULE(serialutil, Init)

