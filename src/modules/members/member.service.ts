import { NotFoundError, ValidationApiError } from "@/core/http/errors";

import { memberRepository } from "./member.repository";
import {
  createMemberSchema,
  updateMemberSchema,
} from "./member.validation";

class MemberService {
  async list() {
    const items = await memberRepository.findAll();
    return {
      message: "Members fetched",
      data: items,
    };
  }

  async create(input: unknown) {
    const parsed = createMemberSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const member = await memberRepository.create(parsed.data.name);
    return {
      message: "Member created",
      data: member,
    };
  }

  async detail(id: string) {
    const member = await memberRepository.findById(id);
    if (!member) {
      throw new NotFoundError("Member not found");
    }

    return {
      message: "Member fetched",
      data: member,
    };
  }

  async update(id: string, input: unknown) {
    const parsed = updateMemberSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationApiError(parsed.error.issues);
    }

    const member = await memberRepository.update(id, parsed.data);
    if (!member) {
      throw new NotFoundError("Member not found");
    }

    return {
      message: "Member updated",
      data: member,
    };
  }

  async remove(id: string) {
    const member = await memberRepository.delete(id);
    if (!member) {
      throw new NotFoundError("Member not found");
    }

    return {
      message: "Member deleted",
      data: member,
    };
  }
}

export const memberService = new MemberService();
