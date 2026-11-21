import { EquipamentoService } from "./EquipamentoService";
import { NextRequest, NextResponse } from "next/server";

export class EquipamentoController {

    private equipamentoService = new EquipamentoService();

    async buscarTodos() {

        try{
            const todosEquipamentos = await this.equipamentoService.buscarTodos();

            // retorna as informações de todos os equipamentos para o front
            return NextResponse.json(todosEquipamentos.map(equipamento => equipamento.getTodasInformacoes()));

        }catch(erro){
            console.error(erro)

            return NextResponse.json({erro : "Erro interno no servidor."}, {status : 500});
        }

    }

    async buscarPorId(id: number){

        if (!Number.isInteger(id) || id <= 0) {return NextResponse.json({ erro: "ID inválido." },{ status: 400 });}

        try{
            const equipamento = await this.equipamentoService.buscarPorId(Number(id))

            return NextResponse.json(equipamento.getTodasInformacoes());

        }catch(erro){

            if(erro instanceof Error && erro.message === "Equipamento não encontrado."){
                return NextResponse.json({erro : erro.message},{status : 404})
            };

            console.error(erro)

            return NextResponse.json({erro : "Erro interno no servidor."}, {status : 500});
        }
    }

    async criar(req: NextRequest){


        try{

            const dados = await req.json();

            // verifica se os dados enviados pelo front estão no formato correto antes de chamar o service
            if (dados === null || typeof dados !== "object" ||Array.isArray(dados)) {
                return NextResponse.json({ erro: "Dados do equipamento inválidos." },{ status: 400 });
            }

            const equipamento = await this.equipamentoService.criar(dados)

            // retorna o equipamento cadastrado com o código 201
            return NextResponse.json(equipamento.getTodasInformacoes(), {status : 201});

        }catch(erro){

            // verifica se ocorreu algum erro na escrita do JSON enviado pelo front
            if (erro instanceof SyntaxError) {
                return NextResponse.json({ erro: "JSON malformado." },{ status: 400 });
            }
            // identifica os erros de validação e retorna o código 400 para o front
            if(erro instanceof Error && 
            [ 
                "A identificação do equipamento é inválida.",
                "O horímetro não pode ser negativo ou inválido.",
                "Status do equipamento inválido.",
                "A marca do equipamento é inválida.",
                "O modelo do equipamento é inválido.",
                "O ano de fabricação é inválido.",
                "A categoria do equipamento é inválida.",
                "O intervalo de manutenção é inválido.",
                "O ID da propriedade é inválido.",
                "Já existe um equipamento com essa identificação na propriedade."
            ].includes(erro.message)){
                return NextResponse.json({erro : erro.message}, {status : 400})
            }

            console.error(erro)
            return NextResponse.json({erro : "Erro interno no servidor."}, {status : 500});

        }
    }

    async atualizar(id: number, req: NextRequest){

        if (!Number.isInteger(id) || id <= 0) {return NextResponse.json({ erro: "ID inválido." },{ status: 400 });}

        try{

            const dados = await req.json()

            // verifica se os dados enviados pelo front estão no formato correto antes de chamar o service
            if (dados === null || typeof dados !== "object" ||Array.isArray(dados)) {
                return NextResponse.json({ erro: "Dados do equipamento inválidos." },{ status: 400 });
            }

            const equipamento = await this.equipamentoService.atualizar(id, dados)

            return NextResponse.json(equipamento.getTodasInformacoes(), {status : 200})

        }catch(erro){

            // verifica se ocorreu algum erro na escrita do JSON enviado pelo front
            if (erro instanceof SyntaxError) {

                return NextResponse.json({ erro: "JSON malformado." },{ status: 400 });

            }
            // identifica os erros de validação e retorna o código 400 para o front
            if(erro instanceof Error && [
                "O horímetro não pode ser menor que o anterior.",
                "A identificação do equipamento é inválida.",
                "O horímetro não pode ser negativo ou inválido.",
                "Status do equipamento inválido.",
                "A marca do equipamento é inválida.",
                "O modelo do equipamento é inválido.",
                "O ano de fabricação é inválido.",
                "A categoria do equipamento é inválida.",
                "O intervalo de manutenção é inválido.",
                "O ID da propriedade é inválido.",
                "Já existe um equipamento com essa identificação na propriedade."
            ].includes(erro.message)){
                return NextResponse.json({erro : erro.message}, {status : 400})
            };

            if(erro instanceof Error && erro.message === "Equipamento não encontrado."){
                return NextResponse.json({erro : erro.message},{status : 404})
            };


            console.error(erro)
            return NextResponse.json({erro : "Erro interno no servidor."}, {status : 500});
        }
    }

    async excluir(id : number){

        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json({ erro: "ID inválido." }, { status: 400 });
        }

        try{
            await this.equipamentoService.excluir(Number(id))

            // retorna 204 quando exclui com sucesso, sem precisar enviar dados de volta
            return new NextResponse(null, {status : 204});

        }catch(erro){

            if(erro instanceof Error && erro.message === "Equipamento não encontrado."){
                return NextResponse.json({erro : erro.message},{status : 404})  
            };

            console.error(erro)
            return NextResponse.json({erro : "Erro interno no servidor."}, {status : 500});
        }

    }

}